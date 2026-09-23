import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getPostById, updatePoste } from '../services/postService';
import { getCategories } from '../services/categoriesService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  updatePost: { id: string };
};

type UpdatePostRouteProp = RouteProp<RootStackParamList, 'updatePost'>;

interface Categorie {
  id: number;
  nomCat: string;
}

const regions = [
  "Nabeul", "Tunis", "Ben Arous", "Manouba", "Ariana", "Benzart", "Beja", "Jandouba", "Seliana", "Kef",
  "Sousse", "Monastir", "Mahdia", "Kairouane", "Kasserine", "Sidi Bouzid", "Gafsa", "Kébili",
  "Sfax", "Tozeur", "Médenine", "Gabès", "Tataouine"
];

const UpdatePost = () => {
  const route = useRoute<UpdatePostRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [post, setPost] = useState({
    nomPoste: '',
    descriptionPoste: '',
    lieuPoste: '',
    regionPoste: '',
    typePoste: '',
    categorie_id: '',
  });

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Sélectionner une région');
  const [isRegionModalVisible, setRegionModalVisible] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
        setSelectedCategoryId(data.categorie_id.toString());
        setSelectedRegion(data.regionPoste);
      } catch (error) {
        console.error('Erreur lors de la récupération du poste:', error);
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

    fetchPost();
    fetchCategories();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun token trouvé');
      }
      await updatePoste(id, { ...post, categorie_id: selectedCategoryId, regionPoste: selectedRegion }, token);
      Alert.alert('Succès', 'Le poste a été mis à jour avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du poste:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du poste');
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
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le Poste</Text>
      <Text style={styles.label}>Nom du poste</Text>
      <TextInput
        style={styles.input}
        value={post.nomPoste}
        onChangeText={(text) => setPost({ ...post, nomPoste: text })}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={post.descriptionPoste}
        onChangeText={(text) => setPost({ ...post, descriptionPoste: text })}
      />
      <Text style={styles.label}>Lieu</Text>
      <TextInput
        style={styles.input}
        value={post.lieuPoste}
        onChangeText={(text) => setPost({ ...post, lieuPoste: text })}
      />
      <Text style={styles.label}>Région</Text>
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
      <Text style={styles.label}>Type</Text>
      <TextInput
        style={styles.input}
        value={post.typePoste}
        onChangeText={(text) => setPost({ ...post, typePoste: text })}
      />
      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.pickerContainer}>
        <FlatList data={categories} keyExtractor={(item) => item.id.toString()} renderItem={renderCategoryItem} />
      </View>
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
  <Text style={styles.updateButtonText}>Mettre à jour</Text>
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F8F8', // Added a light background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C87', // Color updated to match one of the provided colors
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4A7C87', // Updated to match the theme
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7A738', // Changed border color to match provided color
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#F8F8F8', // Light background for picker container
    borderRadius: 30,
    padding: 15,
    marginTop: 15,
  },
  categoryItem: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#8EB6AD', // Category item background updated to match provided color
    marginVertical: 5,
  },
  selectedCategory: {
    backgroundColor: '#D7A738', // Selected category color changed
  },
  dropdown: {
    width: '100%',
    padding: 15,
    backgroundColor: '#8EB6AD', // Dropdown background updated to match
    borderRadius: 10,
    marginTop: 15,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  updateButton: {
    backgroundColor: '#4A7C87',  // Couleur de fond
    paddingVertical: 15,         // Espacement vertical
    paddingHorizontal: 25,       // Espacement horizontal
    borderRadius: 10,           // Coins arrondis
    alignItems: 'center',       // Centrer le texte
    justifyContent: 'center',   // Centrer le texte
    marginTop: 20,              // Espacement en haut
  },
  updateButtonText: {
    color: '#F8F8F8',  // Couleur du texte
    fontSize: 16,      // Taille du texte
    fontWeight: 'bold', // Gras
  },
});

export default UpdatePost;
