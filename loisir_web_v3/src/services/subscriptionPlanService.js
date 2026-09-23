import { authApi } from './api';

export const getAllSubscriptionPlans = async () => {
  try {
    const response = await authApi.get('/subscription-plans');
    return response.data.plans;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSubscriptionPlanById = async (id) => {
  try {
    const response = await authApi.get(`/subscription-plans/${id}`);
    return response.data.plan;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addSubscriptionPlan = async (planData) => {
  try {
    const response = await authApi.post('/subscription-plans', planData);
    return response.data.plan;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSubscriptionPlan = async (id, planData) => {
  try {
    const response = await authApi.put(`/subscription-plans/${id}`, planData);
    return response.data.plan;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSubscriptionPlan = async (id) => {
  try {
    await authApi.delete(`/subscription-plans/${id}`);
  } catch (error) {
    throw error.response?.data || error;
  }
};