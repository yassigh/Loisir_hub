//src/screens/services/activityService.js
import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = '/activites-payantes';

export const getAllActivities = async () => {
  try {
    const response = await api.get('/activites-payantes');
    // La réponse est un objet, il faut le transformer en tableau
    const activitiesObj = response.data.activites_payantes;
    const activities = Object.values(activitiesObj || {});
    return activities;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    throw error;
  }
};

export const addActivity = async (activityData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Aucun token trouvé');
    }
    const response = await api.post(API_BASE_URL, activityData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'activité:', error);
    throw error;
  }
};

export const getActivityById = async (idActP) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${idActP}`);
    return response.data.activite_payant;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    throw error;
  }
};

export const updateActivity = async (idActP, activityData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Aucun token trouvé');
    }
    const response = await api.put(`${API_BASE_URL}/${idActP}`, activityData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    throw error;
  }
};

export const deleteActivity = async (idActP) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Aucun token trouvé');
    }
    const response = await api.delete(`${API_BASE_URL}/${idActP}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    throw error;
  }
};