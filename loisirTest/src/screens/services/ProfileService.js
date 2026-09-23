// ProfileService.js
import { authApi } from './Api';


const updateEntreprise = async (data) => {
  try {
    const response = await authApi.put('/entreprise/update', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {  updateEntreprise };
