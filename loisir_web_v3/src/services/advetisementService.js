import { api,authApi } from './api';

// Récupérer toutes les publicités (pour admin)
export const getAllAdvertisementsForAdmin = async () => {
  try {
    const response = await api.get('/admin/publicites');
    return response.data.publicites;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer toutes les publicités (public ou filtrées par statut)
export const getAllAdvertisements = async (status = 'approved') => {
  try {
    const params = { status };
    const response = await api.get('/publicites', { params });
    return response.data.publicites;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer les publicités d'une entreprise spécifique
export const getEnterpriseAdvertisements = async () => {
  try {
    const response = await api.get('/entreprise/publicites');
    return response.data.publicites;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer une seule publicité par ID
export const getAdvertisementById = async (id) => {
  try {
    const response = await api.get(`/publicites/${id}`);
    return response.data.publicite;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Ajouter une nouvelle publicité
export const addAdvertisement = async (advertisementData) => {
  try {
    const response = await api.post('/publicites', advertisementData);
    console.log('Advertisement API Response:', response.data);
    // Vérifier l'emplacement possible de l'ID dans la réponse
    const advertisementId = response.data.id || 
                            response.data.publicite?.id || 
                            response.data.publicite?.idPub;
    if (advertisementId) {
      return {
        id: advertisementId,
        ...response.data.publicite
      };
    }
    throw new Error('Advertisement ID not found in response');
  } catch (error) {
    console.error('Add advertisement error:', error);
    throw error;
  }
};

// Mettre à jour une publicité existante
export const updateAdvertisement = async (id, advertisementData) => {
  try {
    const response = await api.put(`/publicites/${id}`, advertisementData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Supprimer une publicité
export const deleteAdvertisement = async (id) => {
  try {
    const response = await api.delete(`/publicites/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mettre à jour le statut d'une publicité (admin seulement)
export const updateAdvertisementStatus = async (id, status) => {
  try {
    const response = await api.put(`/publicites/${id}/status`, { 
      statut: status // Changer 'status' en 'statut'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const initiatePublicitePayment = async (publiciteId) => {
  try {
    const response = await authApi.post(`/entreprise/paiements/publicites/initiate`, {
      publicite_id: publiciteId
    });
    
    if (response.data.status === 'success') {
      return {
        payment_url: response.data.payment_url
      };
    }
    throw new Error('Payment initiation failed');
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};