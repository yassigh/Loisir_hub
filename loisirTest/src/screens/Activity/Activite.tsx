import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAllActivities, deleteActivity } from '../services/activityService';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  updateActivite: { idActP: string };
  AddActivity: undefined;
};

interface Activite {
  idActP: string | number;
  nomActP: string;
  descriptionP: string;
  lieuP: string;
  regionP: string;
  prixP: number;
  offreP: string;
  categorie_id: string | number;
}

const Activite = () => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchActivites = async () => {
      try {
        const data = await getAllActivities();
        setActivites(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
      }
    };

    fetchActivites();
  }, []);

  const handleDelete = async (idActP: string | number) => {
    try {
      await deleteActivity(idActP);
      Alert.alert('Succès', 'L\'activité a été supprimée avec succès');
      setActivites(activites.filter(activity => activity.idActP !== idActP));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de l\'activité');
    }
  };

  const renderItem = ({ item }: { item: Activite }) => (
    <View style={styles.activityContainer}>
      <Text style={styles.activityTitle}>{item.nomActP}</Text>
      <Text>{item.descriptionP}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('updateActivite', { idActP: item.idActP.toString() })}
      >
        <Text style={styles.buttonText}>Modifier</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={() => handleDelete(item.idActP)}
      >
        <Text style={styles.buttonText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Ajouter une activité" onPress={() => navigation.navigate('AddActivity')} />
      <FlatList
        data={activites}
        renderItem={renderItem}
        keyExtractor={(item) => item.idActP.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  activityContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#4A7C87',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#D9534F',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Activite;