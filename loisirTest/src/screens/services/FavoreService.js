import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('Aucun token trouvé');
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error.message);
    throw error;
  }
};

const handleRequest = async (method, url, data = null) => {
  try {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}` };

    const response = await (method === 'get' || method === 'delete'
      ? api[method](url, { headers })
      : api[method](url, data, { headers }));

    console.log(`Réponse ${method.toUpperCase()} ${url}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la requête ${method.toUpperCase()} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Récupérer les favores d'un utilisateur
export const getFavores = async (userId) => {
  try {
    const favores = await handleRequest('get', `/favores/${userId}`);
    console.log('Favores récupérés:', favores); // Debug
    return favores;
  } catch (error) {
    console.error('Erreur lors de la récupération des favores:', error.response?.data || error.message);
    throw error;
  }
};
// 🔹 Créer une favore
export const createFavore = async (favoreData) => handleRequest('post', '/favores', favoreData);

// 🔹 Supprimer une favore
export const deleteFavore = async (id) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('Token non trouvé');

    console.log('Suppression du favori avec ID :', id);

    const headers = { Authorization: `Bearer ${token}` };

    const response = await api.delete(`/favores/${id}`, { headers });

    console.log('Favori supprimé avec succès:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la favore:', error.response?.data || error.message);
    throw error;
  }
};
// 🔹 Supprimer une favore
export const suppFavore = async (favoreId) => {
  try {
    console.log('Tentative de suppression du favori avec ID :', favoreId);

    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('Token non trouvé');

    const headers = { Authorization: `Bearer ${token}` };

    // Envoyer la requête DELETE au backend
    const response = await api.delete(`/favores/${favoreId}`, { headers });

    console.log('Favori supprimé avec succès:', response.data);
    return response.data; // Retourne la réponse si la suppression a réussi
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Favori non trouvé, suppression ignorée.');
      return null; // Si le favori n'existe pas
    }
    console.error('Erreur lors de la suppression du favori:', error.response?.data || error.message);
    throw error;
  }
};