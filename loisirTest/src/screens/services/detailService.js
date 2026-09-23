import { authApi } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getEntrepriseDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun token trouvé !');
      }
      const response = await authApi.get('/entreprise/getDetails', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.entreprise;
   
    } catch (error) {
      throw error;
    }
  };export default { getEntrepriseDetails };
  
export const getEntreprise = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun token trouvé !');
      }
      const response = await authApi.get('/entreprise/getDetails', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Réponse de l'API : ", response.data); 
      return response.data.entreprise;
 
    } catch (error) {
      throw error; 
    }
  };