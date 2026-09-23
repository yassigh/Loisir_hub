import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, FlatList, Modal } from 'react-native';
import { ajouterpost } from '../services/postService'; 

import { getCategories } from '../services/categoriesService';
const regions = [
  "Nabeul", "Tunis", "Ben Arous", "Manouba", "Ariana", "Benzart", "Beja", "Jandouba", "Seliana", "Kef",
  "Sousse", "Monastir", "Mahdia", "Kairouane", "Kasserine", "Sidi Bouzid", "Gafsa", "Kébili",
  "Sfax", "Tozeur", "Médenine", "Gabès", "Tataouine"
];
const AddPost = () => {
  const [postName, setPostName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Sélectionner une région');
  const [isRegionModalVisible, setRegionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const mappedCategories = data.map((category: { nomCat: any; id: number; name: string }) => ({
        id: category.id,
        nomCat: category.nomCat,
      }));
      setCategories(mappedCategories);
      if (mappedCategories.length > 0) {
        setSelectedCategoryId(mappedCategories[0].id.toString());
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les catégories');
    }
  };

  // Fonction pour gérer l'ajout de poste
  const handleAddPost = async () => {
    if (!postName || !description || !location || !selectedRegion || !selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner une catégorie.');
      return;
    }

    setLoading(true);
    
    try {
      const postData = {
        nomPoste: postName,
        descriptionPoste: description,
        lieuPoste: location,
        regionPoste: selectedRegion,
        typePoste: 'Null', // Remplace par une valeur valide si nécessaire
        categorie_id: selectedCategoryId,
      };
      
      const response = await ajouterpost(postData);
      Alert.alert('Succès', 'Poste ajouté avec succès');
      
      // Réinitialisation des champs après l'ajout
      setPostName('');
      setDescription('');
      setLocation('');
      setSelectedRegion('Sélectionner une région');
      setSelectedCategoryId('');
    } catch (error) {
      console.error('Erreur lors de lajout du poste:', error);
      const errorMessage = (error as any).response?.data?.message || 'Impossible de créer le poste.';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };
 
  interface Categorie {
    id: number;
    nomCat: string;
  }

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
  const handleCategorySelect = (id: number) => {
    setSelectedCategoryId(id.toString());
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajouter un Poste</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <TextInput
        style={styles.inputField}
        placeholder="Nom du Poste"
        value={postName}
        onChangeText={setPostName}
      />
      <TextInput
        style={styles.inputField}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.inputField}
        placeholder="Lieu"
        value={location}
        onChangeText={setLocation}
      />
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
<Text style={styles.label}>Category:</Text>
              <View style={styles.pickerContainer}>
                <FlatList data={categories} keyExtractor={(item) => item.id.toString()} renderItem={renderCategoryItem} />
              </View>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleAddPost}
        disabled={loading}
      >
        <Text style={styles.shareButtonText}>{loading ? 'Chargement...' : 'Ajouter le Poste'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
 
  dropdown: { width: '90%', padding: 15, backgroundColor: '#e0e0e0', borderRadius: 10, marginTop: 15 },
  modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
 
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '60%',
    paddingTop: 30,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  logo: {
    width: 110,
    height: 35,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  inputField: {
    width: '90%',
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    padding: 15,
    marginTop: 15,
    fontSize: 14,
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#8eb6ad',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 70,
    marginTop: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    padding: 15,
    marginTop: 15,
  },
  categoryItem: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  selectedCategory: {
    backgroundColor: '#8eb6ad',
  },
});

export default AddPost;