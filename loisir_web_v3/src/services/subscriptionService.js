import { authApi } from './api';

export const getCurrentSubscription = async () => {
  try {
    const response = await authApi.get('/entreprise/subscriptions/current');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const subscribeToplan = async (planData) => {
  try {
    const response = await authApi.post('/entreprise/subscriptions/subscribe', planData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelSubscription = async () => {
  try {
    const response = await authApi.post('/entreprise/subscriptions/cancel');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSubscriptionHistory = async () => {
  try {
    const response = await authApi.get('/entreprise/subscriptions/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSubscriptionLimits = async () => {
  try {
    const response = await authApi.get('/entreprise/subscriptions/limits');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBatchLimits = async (entrepriseIds) => {
  try {
    const response = await authApi.post('/subscriptions/batch-limits', { entreprise_ids: entrepriseIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const initiatePayment = async (paymentData) => {
  try {
    const response = await authApi.post('/entreprise/subscriptions/initiate', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyPayment = async (paymentId) => {
  try {
    const response = await authApi.get(`/entreprise/subscriptions/verify/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Fonction pour obtenir tous les abonnements (admin)
export const getAllSubscriptionsForAdmin = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
    if (filters.plan) queryParams.append('plan', filters.plan);
    if (filters.entreprise) queryParams.append('entreprise', filters.entreprise);
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    const response = await authApi.get(`/admin/subscriptions?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Obtenir les détails d'un abonnement spécifique (admin)
export const getSubscriptionDetailsForAdmin = async (id) => {
  try {
    const response = await authApi.get(`/admin/subscriptions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};