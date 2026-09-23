import { api } from './api';

export const getAllEventsForAdmin = async () => {
  try {
    const response = await api.get('/admin/evenements');
    return response.data.evenements || []; // Changed from .events to .evenements
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllEvents = async (categorieId = null) => {
  try {
    const params = categorieId ? { categorie_id: categorieId } : {};
    const response = await api.get('/evenements', { params });
    return response.data.evenements;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await api.get(`/evenements/${id}`);
    return response.data.evenement;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addEvent = async (eventData) => {
  try {
    const response = await api.post('/evenements', eventData);
    console.log('Event API Response:', response.data);
    
    // Check for ID in response
    const eventId = response.data.id || 
                   response.data.evenement?.id;
    
    if (eventId) {
      return {
        id: eventId,
        ...response.data.evenement
      };
    }
    
    throw new Error('Event ID not found in response');
  } catch (error) {
    console.error('Add event error:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/evenements/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/evenements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEnterpriseEvents = async () => {
  try {
    const response = await api.get('/entreprise/evenements');
    return response.data.evenements;
  } catch (error) {
    throw error.response?.data || error;
  }
};
  export const updateEventStatus = async (id, status) => {
    try {
      const response = await api.put(`/evenements/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
};