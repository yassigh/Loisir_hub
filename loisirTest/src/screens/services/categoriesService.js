import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = '/categories';

export const getCategories = async () => {
  try {
    const response = await api.get(API_URL);
    const categories = response.data.categories;

    if (!Array.isArray(categories)) {
      console.error('Les catégories ne sont pas un tableau:', categories);
      return Object.values(categories); // Convertir en tableau si nécessaire
    }

    return categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories', error);
    throw error;
  }
};

export const createCategorie = async (nomCat, descriptionCat) => {
  try {const token = await AsyncStorage.getItem('token'); // ou récupère le token correctement

    const response = await api.post(API_URL, { nomCat, descriptionCat }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.categorie;
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie', error);
    throw error;
  }
};

export const updateCategorie = async (id, nomCat, descriptionCat) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, { nomCat, descriptionCat });
    return response.data.categories;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie', error);
    throw error;
  }
};

export const deleteCategorie = async (id) => {
  try {
    await api.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie', error);
    throw error;
  }
};
