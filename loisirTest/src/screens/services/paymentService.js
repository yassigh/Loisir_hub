import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export const initiatePayment = async (reservationId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await api.post(`/paiements/reservation/${reservationId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.payment_url) {
      await Linking.openURL(response.data.payment_url);
      return response.data;
    }

    throw new Error('URL de paiement non reçue');
  } catch (error) {
    console.error('Erreur initiation paiement:', error.response?.data || error.message);
    throw error;
  }
};
export const verifyPayment = async (paymentId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await api.get(`/paiements/verify/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    throw error;
  }
};