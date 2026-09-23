import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ajouterEvenement = async (eventData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
  
    const response = await api.post('/evenements', eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', // Assurez-vous que le type de contenu est correctement défini
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      // Affichez le message d'erreur détaillé du serveur
      throw new Error(error.response?.data?.message || 'Une erreur est survenue');
    } else {
      throw new Error('Erreur inconnue');
    }
  }
};

export const updateEvenement = async (id, eventData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    const response = await api.put(`/evenements/${id}`, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement :", error.response?.data || error.message);
    throw error.response?.data?.message || 'Une erreur est survenue';
  }
};

export const getEvent = async (id) => {
  try {
    const response = await api.get(`/evenements/${id}`);
    return response.data.evenement;
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue lors de la récupération de l\'événement';
  }
};

export const getAllEvent = async () => {
  try {
    const response = await api.get('/evenements');
    const events = response.data.evenements;

    if (!Array.isArray(events)) {
      console.error('Les événements ne sont pas un tableau:', events);
      return Object.values(events); // Convertir en tableau
    }

    return events;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
};

export const deleteEvenement = async (id) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    const response = await api.delete(`/evenements/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue lors de la suppression de l\'événement';
  }
};