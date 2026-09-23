import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { useContext } from 'react'; 

export const createReservation = async (reservationData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentification requise');
    }

    console.log('Creating reservation:', reservationData);

    const response = await api.post('/reservations', reservationData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Reservation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reservation error:', error.response?.data || error.message);
    throw error;
  }
};

//historique reservation
export const getReservationHistory = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    
    const response = await api.get('/historique/reservations', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.reservations;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
};

//delete reservation 
export const deleteReservation = async (reservationId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await api.delete(`/reservations/${reservationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    throw error;
  }
};
//update reservation 
export const updateReservation = async (reservationId, updateData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }

    console.log('Updating reservation:', {
      reservationId,
      updateData
    });

    const response = await api.put(`/reservations/${reservationId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Update response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error.response?.data || error.message);
    throw error.response?.data || {
      message: 'Erreur lors de la mise à jour de la réservation',
      error: error.message
    };
  }
};
export const getReservationById = async (reservationId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('Token manquant');
    const response = await api.get(`/reservations/${reservationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.reservation;
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    throw error;
  }
};

