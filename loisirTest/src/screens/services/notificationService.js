import { authApi } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await authApi.get('/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.notifications) {
      return response.data.notifications;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data || error);
    return [];
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await authApi.post(`/notifications/${notificationId}/mark-as-read`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error.response?.data || error);
    throw error;
  }
};