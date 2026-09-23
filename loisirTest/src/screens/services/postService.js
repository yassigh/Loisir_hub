import { api } from './Api';

export const getAllPostes = async () => {
  try {
    const response = await api.get('/postes');
    const postes = response.data.postes;

    if (!Array.isArray(postes)) {
      console.error('Les postes ne sont pas un tableau:', postes);
      return Object.values(postes); // Convertir en tableau
    }

    return postes;
  } catch (error) {
    console.error('Erreur lors de la récupération des postes:', error);
    throw error;
  }
};


// Ajouter un nouveau poste
export const ajouterpost = async (postData) => {
  try {
    const response = await api.post('/postes', postData);
    return response.data.postes; 
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue lors de l\'ajout du poste';
  }
};



// Récupérer un poste spécifique par son ID
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/postes/${postId}`);
    console.log('Données récupérées pour le poste:', response.data); // Debug
    return response.data.poste; // Assurez-vous que la clé "poste" correspond à la réponse de l'API
  } catch (error) {
    console.error('Erreur lors de la récupération du poste:', error);
    throw error.response?.data?.message || 'Une erreur est survenue lors de la récupération du poste';
  }
};

// Mettre à jour un poste existant
export const updatePoste = async (postId, updatedData, token) => {
  try {
    const response = await api.put(`/postes/${postId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`, // Ajout du token pour l'authentification
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du poste';
  }
};
// Supprimer un poste existant
export const deletePoste = async (postId) => {
  try {
    const response = await api.delete(`/postes/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue lors de la suppression du poste';
  }
};
