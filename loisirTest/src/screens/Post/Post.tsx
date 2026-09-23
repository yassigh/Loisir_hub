import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAllPostes, deletePoste } from '../services/postService';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  updatePost: { id: string };
  AddPost: undefined;
};

interface Poste {
  id: string | number;
  nomPoste: string;
  descriptionPoste: string;
  lieuPoste: string;
  regionPoste: string;
  typePoste: string;
  categorie_id: string | number;
}

const Post = () => {
  const [postes, setPostes] = useState<Poste[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchPostes = async () => {
      try {
        const data = await getAllPostes();
        setPostes(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des postes:', error);
      }
    };

    fetchPostes();
  }, []);

  const handleDelete = async (id: string | number) => {
    try {
      await deletePoste(id);
      Alert.alert('Succès', 'Le poste a été supprimé avec succès');
      setPostes(postes.filter(post => post.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du poste:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du poste');
    }
  };

  const renderItem = ({ item }: { item: Poste }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.nomPoste}</Text>
      <Text>{item.descriptionPoste}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('updatePost', { id: item.id.toString() })}
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
    <View style={styles.container}>
        <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPost')}
      >
        <Text style={styles.addButtonText}>Ajouter un Poste</Text>
      </TouchableOpacity>
      <FlatList
        data={postes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({

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
  },
  postContainer: {
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
  postTitle: {
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

export default Post;