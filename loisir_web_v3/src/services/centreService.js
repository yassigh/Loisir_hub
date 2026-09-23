import { authApi } from './api';

export const getAllCentres = async () => {
  try {
    const response = await authApi.get('/centres-interet');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addCentre = async (centreData) => {
    try {
      const response = await authApi.post('/centres-interet', centreData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };
  
  export const updateCentre = async (id, centreData) => {
    try {
      const response = await authApi.put(`/centres-interet/${id}`, centreData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };
export const deleteCentre = async (id) => {
  try {
    const response = await authApi.delete(`/centres-interet/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};