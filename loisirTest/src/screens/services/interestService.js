import { authApi } from './Api'; // Assurez-vous que authApi est importé correctement

export const getCentresInteret = async () => {
    try {
      if (!authApi) {
        console.error('authApi est undefined');
        throw new Error('authApi n\'est pas configuré correctement.');
      }
  
      const response = await authApi.get('/centres-interet'); // Vérifiez que l'URL est correcte
      return response.data; // Retourne les données de l'API
    } catch (error) {
      console.error('Erreur lors de la récupération des centres d\'intérêt:', error);
      throw error; // Relance l'erreur pour la gérer dans le composant
    }
  };

export const saveUserInterests = async (userId, interests) => {
  try {
    const response = await authApi.post('/user/centres-interet', {
      user_id: userId,
      centres_interet: interests,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des centres d\'intérêt:', error);
    throw error;
  }
};