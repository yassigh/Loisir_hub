import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Platform, FlatList, Modal } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEvent, updateEvenement } from '../services/EventService';
import { getCategories } from '../services/categoriesService';

type RootStackParamList = {
  editEvenement: { id: string };
};

type EditEvenementRouteProp = RouteProp<RootStackParamList, 'editEvenement'>;
type EditEvenementNavigationProp = StackNavigationProp<RootStackParamList, 'editEvenement'>;

interface Categorie {
  id: number;
  nomCat: string;
}

const regions = [
  "Nabeul", "Tunis", "Ben Arous", "Manouba", "Ariana", "Bizerte", "Beja", "Jendouba", "Siliana", "Kef",
  "Sousse", "Monastir", "Mahdia", "Kairouane", "Kasserine", "Sidi Bouzid", "Gafsa", "Kébili",
  "Sfax", "Tozeur", "Médenine", "Gabès", "Tataouine"
];

const EditEvenement: React.FC = () => {
  const route = useRoute<EditEvenementRouteProp>();
  const navigation = useNavigation<EditEvenementNavigationProp>();
  const { id } = route.params;
  const [nomEvent, setNomEvent] = useState('');
  const [descriptionEvent, setDescriptionEvent] = useState('');
  const [lieuEvent, setLieuEvent] = useState('');
  const [regionEvent, setRegionEvent] = useState('');
  const [typeEvent, setTypeEvent] = useState('');
  const [dateDebutEvent, setDateDebutEvent] = useState(new Date());
  const [dateFinEvent, setDateFinEvent] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPickingStartDate, setIsPickingStartDate] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Sélectionner une région');
  const [isRegionModalVisible, setRegionModalVisible] = useState(false);

  useEffect(() => {
    if (!route.params || !route.params.id) {
      Alert.alert('Erreur', 'ID de l\'événement manquant.');
      return;
    }
  
    const fetchEvent = async () => {
      try {
        const event = await getEvent(id);
        setNomEvent(event.nomEvent);
        setDescriptionEvent(event.descriptionEvent);
        setLieuEvent(event.lieuEvent);
        setRegionEvent(event.regionEvent);
        setTypeEvent(event.typeEvent);
        setDateDebutEvent(new Date(event.date_debutEvent));
        setDateFinEvent(new Date(event.date_finEvent));
        setSelectedCategoryId(event.categorie_id.toString());
        setSelectedRegion(event.regionEvent);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger les données de l\'événement.');
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const mappedCategories = data.map((category: { nomCat: any; id: number; name: string }) => ({
          id: category.id,
          nomCat: category.nomCat,
        }));
        setCategories(mappedCategories);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de récupérer les catégories');
      }
    };

    fetchEvent();
    fetchCategories();
  }, [route.params]);

  const showPicker = (isStart: boolean) => {
    setIsPickingStartDate(isStart);
    setShowDatePicker(true);
  };

  const onChange = (event: unknown, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      isPickingStartDate ? setDateDebutEvent(selectedDate) : setDateFinEvent(selectedDate);
    }
  };

  const handleUpdate = async () => {
    if (!nomEvent || !descriptionEvent || !lieuEvent || !selectedRegion || !typeEvent) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (dateFinEvent < dateDebutEvent) {
      Alert.alert('Erreur', 'La date de fin doit être postérieure à la date de début.');
      return;
    }
    setLoading(true);
    try {
      const eventData = {
        nomEvent,
        descriptionEvent,
        lieuEvent,
        regionEvent: selectedRegion,
        typeEvent,
        date_debutEvent: dateDebutEvent.toISOString().split('T')[0],
        date_finEvent: dateFinEvent.toISOString().split('T')[0],
        categorie_id: selectedCategoryId,
      };
      await updateEvenement(id, eventData);
      Alert.alert('Succès', 'Événement mis à jour avec succès');
      navigation.goBack();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id: number) => {
    setSelectedCategoryId(id.toString());
  };

  const renderCategoryItem = ({ item }: { item: Categorie }) => {
    return (
      <TouchableOpacity
        style={[styles.categoryItem, item.id === Number(selectedCategoryId) ? styles.selectedCategory : null]}
        onPress={() => handleCategorySelect(item.id)}
      >
        <Text>{item.nomCat}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modifier un événement</Text>
      <TextInput style={styles.inputField} placeholder="Nom de l'événement" value={nomEvent} onChangeText={setNomEvent} />
      <TextInput style={styles.inputField} placeholder="Description" value={descriptionEvent} onChangeText={setDescriptionEvent} multiline />
      <TextInput style={styles.inputField} placeholder="Lieu" value={lieuEvent} onChangeText={setLieuEvent} />
      
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

      <TextInput style={styles.inputField} placeholder="Type" value={typeEvent} onChangeText={setTypeEvent} />

      <TouchableOpacity style={styles.dateButton} onPress={() => showPicker(true)}>
        <Text style={styles.dateText}>Date de début: {dateDebutEvent.toDateString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dateButton} onPress={() => showPicker(false)}>
        <Text style={styles.dateText}>Date de fin: {dateFinEvent.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={isPickingStartDate ? dateDebutEvent : dateFinEvent} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChange} />
      )}

      <Text style={styles.label}>Catégorie:</Text>
      <View style={styles.pickerContainer}>
        <FlatList data={categories} keyExtractor={(item) => item.id.toString()} renderItem={renderCategoryItem} />
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.shareButtonText}>Mettre à jour</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 30 },
  title: { alignSelf: 'flex-start', fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  inputField: { width: '90%', backgroundColor: '#f8f8f8', borderRadius: 30, padding: 15, marginTop: 10, fontSize: 14, color: '#333' },
  dateButton: { width: '90%', backgroundColor: '#e0f7fa', borderRadius: 30, padding: 15, marginTop: 10, alignItems: 'center' },
  dateText: { fontSize: 16, color: '#00796b' },
  shareButton: { backgroundColor: '#8eb6ad', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 70, marginTop: 10 },
  shareButtonText: { color: '#fff', fontSize: 22, fontWeight: '300' },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  categoryItem: { padding: 10, marginVertical: 5, backgroundColor: '#e0f7fa', borderRadius: 10 },
  selectedCategory: { backgroundColor: '#00796b' },
  pickerContainer: { width: '90%', backgroundColor: '#f8f8f8', borderRadius: 30, padding: 15, marginTop: 10 },
  dropdown: { width: '90%', padding: 15, backgroundColor: '#e0e0e0', borderRadius: 10, marginTop: 15 },
  modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});

export default EditEvenement;