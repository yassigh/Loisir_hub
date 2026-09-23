import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getPubliciteImages = async () => {
  try {
    const response = await api.get('/publicites');
    console.log('Raw publicites response:', response.data);

    if (response.data?.publicites && Array.isArray(response.data.publicites)) {
      const publicites = response.data.publicites.map(pub => ({
        id: pub.id,
        images: pub.images.map(img => ({
          ...img,
          url: `http://192.168.100.122:8000/storage/${img.url}` // Construire l'URL complète
        })),
        date_debut: pub.date_debut,
        nbJours: pub.nbJours
      }));

      return publicites;
    }

    console.error('Invalid publicites data format');
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des publicités:', error);
    throw error;
  }
};

export const createPublicite = async (formData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await authApi.post('/publicites', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur createPublicite:', error);
    throw error;
  }
};