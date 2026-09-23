  //src/services/authService.js
  import { api, authApi } from './api';
  //v3.0 
  export const validateToken = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const userType = localStorage.getItem('user_type');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await authApi.post('/validate-token', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Si la validation réussit, on retourne les données
    return {
      user: {
        ...response.data.user,
        type: userType
      }
    };
  } catch (error) {
    throw error;
  }
};
  //v2.0 marche correctmenet 
  // export const validateToken = async () => {
  //   try {
  //     const token = localStorage.getItem('auth_token');
  //     if (!token) {
  //       throw new Error('No token found');
  //     }
      
  //     const response = await authApi.post('/validate-token', {}, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     localStorage.removeItem('auth_token');
  //     localStorage.removeItem('user_type');
  //     throw error;
  //   }
  // };

//v1.1
// export const validateToken = async () => {
//   const token = localStorage.getItem('auth_token');
  
//   return await authApi.get('/validate-token', {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
// };

//v1.0
// export const validateToken = async () => {
//   try {
//     const response = await authApi.get('/validate-token');
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

export const loginUser = async (credentials) => {
  try {
    const response = await authApi.post('/user/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      const userType = response.data.user.role === 'admin' ? 'admin' : 'user';
      localStorage.setItem('user_type', userType);
      return {
        token: response.data.token,
        user: {
          ...response.data.user,
          type: userType
        }
      };
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

//v1.0
// export const loginUser = async (credentials) => {
//   try {
//     const response = await authApi.post('/user/login', credentials);
//     if (response.data.token) {
//       // Vérifier le rôle de l'utilisateur
//       const userType = response.data.user.role === 'admin' ? 'admin' : 'user';
//       localStorage.setItem('auth_token', response.data.token);
//       localStorage.setItem('user_type', userType);
//     }
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };
export const loginEntreprise = async (credentials) => {
  try {
    const response = await authApi.post('/entreprise/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', 'entreprise');
      return {
        token: response.data.token,
        user: {
          ...response.data.entreprise,
          type: 'entreprise'
        }
      };
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserProfile = async () => {
  try {
    const userType = localStorage.getItem('user_type');
    const endpoint = userType === 'entreprise' ? '/entreprise/getDetails' : '/user/getDetails';
    console.log('User type:', userType);
    const response = await authApi.get(endpoint);
    if (userType === 'entreprise') {
      return { user: response.data.entreprise }; // Extraire l'objet "entreprise"
    } else {
      return { user: response.data.user }; // Extraire l'objet "user"
    }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// //entreprise authentication services v1.0
// export const loginEntreprise = async (credentials) => {
//   try {
//     const response = await authApi.post('/entreprise/login', credentials);
//     if (response.data.token) {
//       localStorage.setItem('auth_token', response.data.token);
//     }
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

export const registerEntreprise = async (data) => {
  try {
    const response = await authApi.post('/entreprise/register', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logoutEntreprise = async () => {
  try {
    await authApi.post('/entreprise/logout');
    localStorage.removeItem('auth_token');
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEntrepriseDetails = async () => {
  try {
    const response = await authApi.get('/entreprise/getDetails');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// // User Authentication Services v1.0
// export const loginUser = async (credentials) => {
//   try {
//     const response = await authApi.post('/user/login', credentials);
//     if (response.data.token) {
//       localStorage.setItem('auth_token', response.data.token);
//       localStorage.setItem('user_type', 'user');
//     }
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

export const registerUser = async (formData) => {
  try {
    const response = await authApi.post('/user/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logoutUser = async () => {
  try {
    await authApi.post('/user/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Password Reset Services
export const sendResetCode = async (email, type = 'user') => {
  try {
    const endpoint = type === 'user' ? '/user/forgot-password' : '/entreprise/forgot-password';
    const response = await authApi.post(endpoint, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyResetCode = async (data, type = 'user') => {
  try {
    const endpoint = type === 'user' ? '/user/verify-reset-code' : '/entreprise/verify-reset-code';
    const response = await authApi.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (data, type = 'user') => {
  try {
    const endpoint = type === 'user' ? '/user/reset-password' : '/entreprise/reset-password';
    const response = await authApi.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const updateEntrepriseProfile = async (formData) => {
  try {
      // Debug logging
      for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
      }

      const response = await authApi.post('/entreprise/update', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          }
      });

      console.log('Server response:', response.data);

      // Modification ici: vérifier la présence de entreprise OU user
      if (!response.data || (!response.data.entreprise && !response.data.user)) {
          throw new Error('Invalid server response');
      }

      // Retourner l'objet avec le user (qui contient les données de l'entreprise)
      return {
          user: response.data.user || response.data.entreprise
      };
  } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// export const updateEntrepriseProfile = async (formData) => {
//   const token = localStorage.getItem('auth_token');
//   try {
//       // Debug logging
//       for (let [key, value] of formData.entries()) {
//           console.log(`${key}:`, value);
//       }

//       const response = await authApi.post('/entreprise/update', formData, {
//           headers: {
//               'Content-Type': 'multipart/form-data',
//               'Authorization': `Bearer ${token}`
//           }
//       });

//       console.log('Server response:', response.data);

//       if (!response.data || !response.data.entreprise) {
//           throw new Error('Invalid server response');
//       }

//       return response.data;
//   } catch (error) {
//       console.error('Profile update error:', error);
//       throw new Error(error.response?.data?.message || 'Failed to update profile');
//   }
// };

// Profile Management Services
export const updateUserProfile = async (formData) => {
  const token = localStorage.getItem('auth_token');
  try {
      // Debug form data
      for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await authApi.post('/user/update', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
          }
      });

      if (!response.data || !response.data.user) {
          throw new Error('Invalid server response');
      }

      return response.data;
  } catch (error) {
      if (error.response?.status === 422) {
          throw new Error(error.response.data.error);
      }
      throw error;
  }
};

export const getUserDetails = async () => {
  try {
    const response = await authApi.get('/user/getDetails');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin Services
export const getAllUsers = async () => {
  const token = localStorage.getItem('auth_token');
  try {
      const response = await authApi.get('/admin/users', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      console.log('Users response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
  }
};

export const getAllEntreprises = async () => {
  const token = localStorage.getItem('auth_token');
  try {
      const response = await authApi.get('/admin/entreprises', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      console.log('Entreprises response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error fetching entreprises:', error);
      throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await authApi.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteEntreprise = async (entrepriseId) => {
  try {
    const response = await authApi.delete(`/admin/entreprises/${entrepriseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
// Ajouter cette nouvelle fonction
export const updateUserRole = async (userId, role) => {
  try {
    const response = await authApi.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Account Deactivation
export const desactivateAccount = async (type = 'user') => {
  try {
    const endpoint = type === 'user' ? '/user/desactiver' : '/entreprise/desactiver';
    const response = await authApi.delete(endpoint);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};