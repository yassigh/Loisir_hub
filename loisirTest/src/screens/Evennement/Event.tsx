import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAllEvent, deleteEvenement } from '../services/EventService';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  editEvenement: { id: string };
  AddEvennement: undefined;
};

interface Evenement {
  id: string | number;
  nomEvent: string;
  descriptionEvent: string;
  lieuEvent: string;
  regionEvent: string;
  typeEvent: string;
  date_debutEvent: string;
  date_finEvent: string;
  categorie_id: string | number;
}

const Event = () => {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        const data = await getAllEvent();
        setEvenements(data.evenements);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      }
    };

    fetchEvenements();
  }, []);

  const handleDelete = async (id: string | number) => {
    try {
      await deleteEvenement(id);
      Alert.alert('Succès', 'L\'événement a été supprimé avec succès');
      setEvenements(evenements.filter(event => event.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de l\'événement');
    }
  };

  const renderItem = ({ item }: { item: Evenement }) => (
    <View style={styles.eventContainer}>
      <Text style={styles.eventTitle}>{item.nomEvent}</Text>
      <Text>{item.descriptionEvent}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('editEvenement', { id: item.id.toString() })}
      >
        <Text style={styles.buttonText}>Modifier</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.buttonText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
        <ImageBackground style={styles.background}>
          {/* Formes décoratives */}
          <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.topLeftLower]} />
          <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
          <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.bottomRight]} />
    
    <View style={styles.container}>
 
              <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEvennement')}
            ><Text style={styles.addButtonText}>Add Event</Text>
                  </TouchableOpacity>
      <FlatList
        data={evenements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        
      />
    </View>    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  decorImage: {
    position: 'absolute',
    width: 300,
    height: 290,
  },
  topLeft: {
    top: -150,
    left: -190,
  },
  topLeftLower: {
    top: -190,
    left: -140,
  },
  bottomRight: {
    bottom: -180,
    right: -130,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    top:80,
  },
  eventContainer: {
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
  eventTitle: {
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

export default Event;