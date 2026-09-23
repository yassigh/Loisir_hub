import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { createCategorie, deleteCategorie, getCategories, updateCategorie } from '../services/categoriesService';

interface Categorie {
  id: number;
  nomCat: string;
  descriptionCat: string;
}

const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nomCat, setNomCat] = useState('');
  const [descriptionCat, setDescriptionCat] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les catégories');
    }
  };

  const handleSubmit = async () => {
    if (!nomCat) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    try {
      if (editingId) {
        await updateCategorie(editingId, nomCat, descriptionCat);
      } else {
        await createCategorie(nomCat, descriptionCat);
      }
      setNomCat('');
      setDescriptionCat('');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la catégorie');
    }
  };

  const handleEdit = (categorie: Categorie) => {
    setNomCat(categorie.nomCat);
    setDescriptionCat(categorie.descriptionCat);
    setEditingId(categorie.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategorie(id);
      fetchCategories();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Catégories</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom de la catégorie"
        placeholderTextColor="#4A7C87"
        value={nomCat}
        onChangeText={setNomCat}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#4A7C87"
        value={descriptionCat}
        onChangeText={setDescriptionCat}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{editingId ? "Mettre à jour" : "Ajouter"}</Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item.nomCat} - {item.descriptionCat}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8EB6AD',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#4A7C87',
  },
  button: {
    backgroundColor: '#4A7C87',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#F9F9F9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#8EB6AD',
  },
  categoryText: {
    flex: 1,
    color: '#4A7C87',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#D7A738',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 8,
    borderRadius: 6,
  },
});

export default CategoriesScreen;
