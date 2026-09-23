import { authApi } from './api';

export const getNotifications = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await authApi.get('/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await authApi.post(`/notifications/${notificationId}/mark-as-read`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error.response?.data || error;
  }
};