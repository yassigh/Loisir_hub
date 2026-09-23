import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token;
};

export const getUserById = async (userId) => {
  try {
    const token = await getToken();
    const response = await api.get(`/user/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
