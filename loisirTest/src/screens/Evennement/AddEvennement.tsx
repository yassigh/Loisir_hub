import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, Alert, ActivityIndicator, Platform, FlatList, 
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ajouterEvenement } from '../services/EventService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCategories } from '../services/categoriesService';
import moment from 'moment';

interface Categorie {
  id: number;
  nomCat: string;
}
const regions = [
  "Nabeul", "Tunis", "Ben Arous", "Manouba", "Ariana", "Bizerte", "Beja", "Jendouba", "Siliana", "Kef",
  "Sousse", "Monastir", "Mahdia", "Kairouane", "Kasserine", "Sidi Bouzid", "Gafsa", "Kébili",
  "Sfax", "Tozeur", "Médenine", "Gabès", "Tataouine"
];

const AddEvennement = () => {
  const [nomEvent, setNomEvent] = useState('');
  const [descriptionEvent, setDescription] = useState('');
  const [lieuEvent, setLieu] = useState('');
  const [regionEvent, setRegion] = useState('');
  const [typeEvent, setType] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPickingStartDate, setIsPickingStartDate] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState('Sélectionner une région');
  const [isRegionModalVisible, setRegionModalVisible] = useState(false);
 
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (data.length > 0) {
        setCategories(data);
        setSelectedCategoryId(data[0].id.toString());
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les catégories');
    }
  };

  const showPicker = (isStart: boolean) => {
    setIsPickingStartDate(isStart);
    setShowDatePicker(true);
  };

  const onChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      isPickingStartDate ? setDateDebut(selectedDate) : setDateFin(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!nomEvent || !descriptionEvent || !lieuEvent || !selectedRegion  || !typeEvent || !selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (dateFin < dateDebut) {
      Alert.alert('Erreur', 'La date de fin doit être après la date de début.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const eventData = {
        nomEvent,
        descriptionEvent,
        lieuEvent,
        regionEvent:selectedRegion,
        typeEvent,
        date_debutEvent: moment(dateDebut).format('YYYY-MM-DD HH:mm:ss'),
        date_finEvent: moment(dateFin).format('YYYY-MM-DD HH:mm:ss'),
        categorie_id: selectedCategoryId,
      };

      console.log('Données envoyées:', JSON.stringify(eventData, null, 2));
      await ajouterEvenement(eventData);

      Alert.alert('Succès', 'Événement ajouté avec succès');
      setNomEvent('');
      setDescription('');
      setLieu('');
      setSelectedRegion('Sélectionner une région');
      setType('');
      setDateDebut(new Date());
      setDateFin(new Date());
      setSelectedCategoryId('');
    } catch (error) {
      Alert.alert('Erreur', (error as any).message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Categorie }) => (
    <TouchableOpacity 
      style={[styles.categoryItem, item.id.toString() === selectedCategoryId ? styles.selectedCategory : null]}
      onPress={() => setSelectedCategoryId(item.id.toString())}
    >
      <Text style={{ color: item.id.toString() === selectedCategoryId ? '#fff' : '#000' }}>{item.nomCat}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un événement</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <TextInput style={styles.inputField} placeholder="Nom de l'événement" value={nomEvent} onChangeText={setNomEvent} />
      <TextInput style={styles.inputField} placeholder="Description de l'événement" value={descriptionEvent} onChangeText={setDescription} multiline />
      <TextInput style={styles.inputField} placeholder="Lieu" value={lieuEvent} onChangeText={setLieu} />
     
      <TextInput style={styles.inputField} placeholder="Type" value={typeEvent} onChangeText={setType} />
 {/* Sélection de la région */}
 <TouchableOpacity style={styles.dropdown} onPress={() => setRegionModalVisible(true)}>
        <Text>{selectedRegion}</Text>
      </TouchableOpacity>
      <Modal visible={isRegionModalVisible} onRequestClose={() => setRegionModalVisible(false)}>
        <View style={styles.modalContainer}>
          {regions.map((region, index) => (
            <TouchableOpacity key={index} style={styles.modalItem} onPress={() => { setSelectedRegion(region); setRegionModalVisible(false); }}>
              <Text>{region}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <TouchableOpacity style={styles.dateButton} onPress={() => showPicker(true)}>
        <Text style={styles.dateText}>Date de début : {moment(dateDebut).format('DD/MM/YYYY')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateButton} onPress={() => showPicker(false)}>
        <Text style={styles.dateText}>Date de fin : {moment(dateFin).format('DD/MM/YYYY')}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={isPickingStartDate ? dateDebut : dateFin}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}

      <Text style={styles.label}>Catégorie :</Text>
      <FlatList data={categories} keyExtractor={(item) => item.id.toString()} renderItem={renderCategoryItem} />

      <TouchableOpacity style={styles.shareButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.shareButtonText}>Partager</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  logo: { width: 110, height: 35, position: 'absolute', top: 10, right: 10 },
  inputField: { width: '90%', backgroundColor: '#f8f8f8', borderRadius: 30, padding: 15, marginTop: 10, fontSize: 14, color: '#333' },
  dateButton: { width: '90%', backgroundColor: '#e0f7fa', borderRadius: 30, padding: 15, marginTop: 10, alignItems: 'center' },
  dateText: { fontSize: 16, color: '#00796b' },
  shareButton: { backgroundColor: '#8eb6ad', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 70, marginTop: 10 },
  shareButtonText: { color: '#fff', fontSize: 22, fontWeight: '300' },
 
  categoryItem: { padding: 10, marginVertical: 5, backgroundColor: '#e0f7fa', borderRadius: 10 },
  selectedCategory: { backgroundColor: '#00796b' },
  label: { width: '90%', fontSize: 16, color: '#333', marginTop: 10 },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
 
  dropdown: { width: '90%', padding: 15, backgroundColor: '#e0e0e0', borderRadius: 10, marginTop: 15 },
  modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
 });

export default AddEvennement;
