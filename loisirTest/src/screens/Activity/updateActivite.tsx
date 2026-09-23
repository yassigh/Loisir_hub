import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getActivityById, updateActivity } from '../services/activityService';
import { getCategories } from '../services/categoriesService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  updateActivite: { idActP: string };
};

type UpdateActiviteRouteProp = RouteProp<RootStackParamList, 'updateActivite'>;

interface Categorie {
  id: number;
  nomCat: string;
}

const UpdateActivite = () => {
  const route = useRoute<UpdateActiviteRouteProp>();
  const navigation = useNavigation();
  const { idActP } = route.params;

  const [activity, setActivity] = useState({
    nomActP: '',
    descriptionP: '',
    lieuP: '',
    regionP: '',
    prixP: '',
    offreP: '',
    categorie_id: '',
  });

  
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getActivityById(idActP);
        if (!data) {
          Alert.alert('Erreur', 'Activité non trouvée');
      
          return;
        }
        setActivity(data);
        setSelectedCategoryId(data.categorie_id?.toString() || '');
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'activité:', error);
        Alert.alert('Erreur', 'Impossible de récupérer les données de l\'activité');
        navigation.goBack();
      }
    };
    

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de récupérer les catégories');
      }
    };

    fetchActivity();
    fetchCategories();
  }, [idActP]);

  const handleUpdate = async () => {
    if (!activity.nomActP || !activity.descriptionP || !activity.lieuP || !activity.regionP || !activity.prixP || !activity.offreP || !selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      const activityData = {
        ...activity,
        prixP: parseFloat(activity.prixP),
        categorie_id: selectedCategoryId,
      };

      await updateActivity(idActP, activityData);
      Alert.alert('Succès', 'Activité mise à jour avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de l\'activité');
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
        value={activity.nomActP}
        onChangeText={(text) => setActivity({ ...activity, nomActP: text })}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={activity.descriptionP}
        onChangeText={(text) => setActivity({ ...activity, descriptionP: text })}
      />
      <Text style={styles.label}>Lieu</Text>
      <TextInput
        style={styles.input}
        value={activity.lieuP}
        onChangeText={(text) => setActivity({ ...activity, lieuP: text })}
      />
      <Text style={styles.label}>Région</Text>
      <TextInput
        style={styles.input}
        value={activity.regionP}
        onChangeText={(text) => setActivity({ ...activity, regionP: text })}
      />
      <Text style={styles.label}>Prix</Text>
      <TextInput
        style={styles.input}
        value={activity.prixP}
        onChangeText={(text) => setActivity({ ...activity, prixP: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Offre</Text>
      <TextInput
        style={styles.input}
        value={activity.offreP}
        onChangeText={(text) => setActivity({ ...activity, offreP: text })}
      />
      <Text style={styles.label}>Catégorie</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
      />
      <Button title="Mettre à jour l'activité" onPress={handleUpdate} />
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

export default UpdateActivite;