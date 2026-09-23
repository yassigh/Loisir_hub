import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addActivity } from '../services/activityService';
import { getCategories } from '../services/categoriesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Categorie {
  id: number;
  nomCat: string;
}

const AddActivity = () => {
  const [activityName, setActivityName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [price, setPrice] = useState('');
  const [offer, setOffer] = useState('');
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de récupérer les catégories');
      }
    };

    fetchCategories();
  }, []);

  const handleAddActivity = async () => {
    if (!activityName || !description || !location || !region || !price || !offer || !selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      const activityData = {
        nomActP: activityName,
        descriptionP: description,
        lieuP: location,
        regionP: region,
        prixP: parseFloat(price),
        offreP: offer,
        categorie_id: selectedCategoryId,
      };

      await addActivity(activityData);
      Alert.alert('Succès', 'Activité ajoutée avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de l\'activité');
    }
  };

  const handleCategorySelect = (id: number) => {
    setSelectedCategoryId(id.toString());
  };

  const renderCategoryItem = ({ item }: { item: Categorie }) => (
    <TouchableOpacity
      style={[styles.categoryItem, item.id === Number(selectedCategoryId) ? styles.selectedCategory : null]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text>{item.nomCat}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nom de l'activité</Text>
      <TextInput
        style={styles.input}
        value={activityName}
        onChangeText={setActivityName}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>Lieu</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />
      <Text style={styles.label}>Région</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
      />
      <Text style={styles.label}>Prix</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Offre</Text>
      <TextInput
        style={styles.input}
        value={offer}
        onChangeText={setOffer}
      />
      <Text style={styles.label}>Catégorie</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
      />
      <Button title="Ajouter l'activité" onPress={handleAddActivity} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
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

export default AddActivity;