//src/services/ReservationService.js
import { api } from './api';
import axios from 'axios';
// Pour l'admin
//v2.0
export const getAllReservationsForAdmin = async () => {
    try {
        const response = await api.get('/admin/reservations');
        // Retourner directement la réponse complète
        return response.data;
    } catch (error) {
        console.error('Error fetching admin reservations:', error);
        throw error;
    }
};
//v1.0
// export const getAllReservationsForAdmin = async () => {
//     try {
//         const response = await api.get('/admin/reservations');
//         return response.data.reservations || [];
//     } catch (error) {
//         console.error('Error fetching admin reservations:', error);
//         throw error;
//     }
// };

// Pour l'entreprise
export const getEnterpriseReservations = async () => {
    try {
        const response = await api.get('/entreprise/reservations');
        return response.data;
    } catch (error) {
        console.error('Error fetching enterprise reservations:', error);
        throw error;
    }
};
export const getEnterpriseClients = async () => {
    try {
      const response = await api.get('/entreprise/reservations');
      return response.data;
    } catch (error) {
      console.error('Error fetching enterprise clients:', error);
      throw error;
    }
  };
export const updateReservationStatus = async (id, etat) => {
    try {
        const token = localStorage.getItem('auth_token'); // Assurez-vous que le token est disponible
        const response = await axios.put(
          `http://127.0.0.1:8000/api/entreprise/reservations/${id}/status`,
          { etat: etat },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
         return response.data;
    } catch (error) {
        console.error('Update status error:', error);
        throw error;
    }
};