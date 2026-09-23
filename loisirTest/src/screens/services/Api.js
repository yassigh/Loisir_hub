import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = 'http://192.168.100.122:8000/api'; // Pour Android Emulator
const API_BASE_URL_ALT = 'http://192.168.100.122:8001/api'; // Port alternatif

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const authApi = axios.create({
  baseURL: API_BASE_URL_ALT,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Intercepteur pour ajouter automatiquement le token
const addAuthToken = async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token'); // Vérifiez que le token est récupéré
    console.log('Token ajouté à la requête :', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
  }
  return config;
};
api.interceptors.request.use(addAuthToken);
authApi.interceptors.request.use(addAuthToken);
export { api, authApi };