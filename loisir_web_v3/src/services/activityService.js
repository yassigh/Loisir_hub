import { api } from './api';

// Get all activities for admin
export const getAllActivitiesForAdmin = async () => {
  try {
    const response = await api.get('/admin/activites-payantes');
    return response.data.activites_payantes;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all activities (public)
export const getAllActivities = async (categorieId = null) => {
  try {
    const params = categorieId ? { categorie_id: categorieId } : {};
    const response = await api.get('/activites-payantes', { params });
    return response.data.activites_payantes;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEnterpriseActivities = async () => {
  try {
    const response = await api.get('/entreprise/activites-payantes');
    return response.data.activites_payantes;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// Get single activity
export const getActivityById = async (id) => {
  try {
    const response = await api.get(`/activites-payantes/${id}`);
    return response.data.activite_payant;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add new activity
export const addActivity = async (activityData) => {
  try {
    const response = await api.post('/activites-payantes', activityData);
    console.log('Activity API Response:', response.data);
    
    // Check for both possible ID locations
    const activityId = response.data.id || 
                      response.data.activite_payant?.idActP || 
                      response.data.activite_payant?.id;
    
    if (activityId) {
      return {
        id: activityId,
        ...response.data.activite_payant
      };
    }
    
    throw new Error('Activity ID not found in response');
  } catch (error) {
    console.error('Add activity error:', error);
    throw error;
  }
};
// export const addActivity = async (activityData) => {
//   try {
//     const response = await api.post('/activites-payantes', activityData);
//     return {
//       id: response.data.id, // Ensure this property exists
//       ...response.data
//     };
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// Update activity
export const updateActivity = async (id, activityData) => {
  try {
    const response = await api.put(`/activites-payantes/${id}`, activityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete activity
export const deleteActivity = async (id) => {
  try {
    const response = await api.delete(`/activites-payantes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update activity status (admin only)
export const updateActivityStatus = async (id, status) => {
  try {
    const response = await api.put(`/activites-payantes/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};