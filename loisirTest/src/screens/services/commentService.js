import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getComments = async (elementType, elementId) => {
  try {
    const response = await api.get(`/commentaires/${elementType}/${elementId}`);
    console.log('Commentaires récupérés:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    // Supprimez user_id du commentData car il sera géré par le backend
    const { user_id, ...restData } = commentData;

    const response = await api.post('/commentaires', restData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur addComment:', error.response?.data || error.message);
    throw error;
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    const response = await api.put(`/commentaires/${commentId}`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    await api.delete(`/commentaires/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire', error);
    throw error;
  }
};