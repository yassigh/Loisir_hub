import { authApi } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const registerEntreprise = async (entrepriseData) => {
  try {
    const response = await authApi.post('/entreprise/register', entrepriseData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Une erreur est survenue';
  }
};
export const getAllEntreprises = async () => {
  try {
    const response = await authApi.get('/entreprises');
    return response.data.entreprises; // Assurez-vous que l'API retourne un tableau d'entreprises
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    throw error;
  }
};
export const loginEntreprise = async (loginData) => {
  try {
    const { email, password } = loginData; // Extraire email et password
    const response = await authApi.post('/entreprise/login', { email, password });

    if (response.status !== 200) {
      throw new Error('Erreur de connexion');
    }

    // Stocker le token dans AsyncStorage
    const token = response.data.token;
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      throw new Error('Token manquant dans la réponse');
    }

    // Retourner la réponse de l'entreprise pour l'utilisation ultérieure
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Une erreur est survenue';
  }
};


export const resetPasswordEntreprise = async (email) => {
  try {
    const response = await authApi.post(`/entreprise/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyResetCodeEntreprise = async (email, resetCode) => {
  try {
    const response = await authApi.post(`/entreprise/verify-reset-code`, { email, reset_code: resetCode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPasswordNewEntreprise = async (email, resetCode, newPassword) => {
  try {
    const response = await authApi.post(`/entreprise/reset-password`, {
      email,
      reset_code: resetCode,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await authApi.get(`/entreprise/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Erreur de vérification';
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await authApi.post('/user/register', userData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;  // Retourne la réponse du serveur
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue';
  }
};

export const updateUser = async (userData, token) => {
  try {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });

    const response = await authApi.put('/user/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Une erreur est survenue';
  }
};

export const verifyEmailUser = async (token) => {
  try {
    const response = await authApi.get(`/user/verify-email/${token}`);
    Alert.alert('Succès', response.message || 'Votre email a été vérifié avec succès !');
  } catch (error) {
    Alert.alert('Erreur', error.message || 'Échec de la vérification de l\'email.');
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await authApi.post('/user/login', loginData);

    if (response.data && response.data.token) {
      // Stocker le token d'authentification
      await AsyncStorage.setItem('auth_token', response.data.token);

      // Stocker les données utilisateur
      const userDataToStore = {
        id: response.data.user.id,
        email: response.data.user.email,
        first_name: response.data.user.first_name,
        last_name: response.data.user.last_name,
      };

      await AsyncStorage.setItem('user_data', JSON.stringify(userDataToStore));
      console.log('Données utilisateur stockées:', userDataToStore);

      return response.data;
    } else {
      throw new Error('Format de réponse invalide');
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};
export const resetPassword = async ({ email, password }) => {
  try {
    const response = await authApi.post('/user/verify-reset-code', { email, password, password_confirmation: password });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Une erreur est survenue lors de la réinitialisation.';
  }
};

// Récupérer toutes les entreprises
export const getEntreprises = async (token) => {
  try {
    const response = await authApi.get('admin/entreprises', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.entreprises;
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises :', error);
    throw error;
  }
};

// Supprimer une entreprise
export const deleteEntreprise = async (entrepriseId, token) => {
  try {
    const response = await authApi.delete(`${'admin/entreprises'}/${entrepriseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l’entreprise :', error);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    const response = await authApi.get(`/user/users/${id}/exists`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur', error);
    throw error;
  }
};
// Récupérer un utilisateur par ID
export const getUserByIdd = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token manquant');
    }
    const response = await authApi.get(`/user/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur', error);
    throw error;
  }
};
export const getUserDetails = async (token) => {
  try {
    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await authApi.get('/user/getDetails', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      throw new Error('Session expirée');
    }
    console.error('Erreur getUserDetails:', error.response || error);
    throw new Error(error.response?.data?.message || 'Erreur de récupération des données utilisateur');
  }
};


export const logoutUser = async (token) => {
  try {
    const response = await authApi.post('/user/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Message de succès
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error.response?.data || error.message);
    throw error;
  }
};
export const logoutEntreprise = async (token) => {
  try {
    const response = await authApi.post('/entreprise/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Message de succès
  } catch (error) {
    throw error; // Gérer l'erreur dans le composant
  }
};
