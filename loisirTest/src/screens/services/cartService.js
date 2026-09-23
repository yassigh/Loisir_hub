import { api } from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

//v4.0
export const getCartItems = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }
    const response = await api.get('/panier', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // Calculer le total
    const items = response.data.items || [];
    const totalAmount = items.reduce((acc, item) => acc + parseFloat(item.prix), 0);
    return {
      ...response.data,
      totalAmount
    };
  } catch (error) {
    console.error('Erreur getCartItems:', error);
    throw error;
  }
};
//v3.0 get CartItems
// export const getCartItems = async () => {
//   try {
//     const token = await AsyncStorage.getItem('auth_token');
//     if (!token) {
//       throw new Error('Token non trouvé');
//     }

//     const response = await api.get('/panier', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
    
//     // Calculer le total
//     const items = response.data.items || [];
//     const totalAmount = items.reduce((acc, item) => acc + parseFloat(item.prix), 0);

//     return {
//       ...response.data,
//       totalAmount
//     };
//   } catch (error) {
//     console.error('Erreur getCartItems:', error);
//     throw error;
//   }
// };

//v2.0 get CartItems
// export const getCartItems = async () => {
//   try {
//     const token = await AsyncStorage.getItem('auth_token');
//     if (!token) {
//       throw new Error('Token non trouvé');
//     }

//     const response = await api.get('/panier', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
    
//     // Retourner directement les données
//     return response.data;
//   } catch (error) {
//     console.error('Erreur getCartItems:', error);
//     throw error;
//   }
// };

//v1.0 get CartItems
// export const getCartItems = async () => {
//   try {
//     const token = await AsyncStorage.getItem('auth_token');
//     if (!token) {
//       throw new Error('Token non trouvé');
//     }

//     // Modifier le chemin selon la nouvelle route
//     const response = await api.get('/panier', {  
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Erreur getCartItems:', error);
//     throw error;
//   }
// };

export const addCartItem = async (reservationId, prix) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    // Nouvelle route pour ajouter un item au panier
    const response = await api.post(`/panier/add/${reservationId}`, {
      prix: prix
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur addCartItem:', error);
    throw error;
  }
};

export const deleteCartItem = async (itemId) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    // Modifier le chemin selon la nouvelle route 
    const response = await api.delete(`/panier/remove/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur deleteCartItem:', error);
    throw error;
  }
};

export const calculateTotalAcceptedPrice = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    // Cette route n'existe plus, utiliser les données du panier à la place
    const response = await api.get('/panier', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.panier?.total_amount || 0;
  } catch (error) {
    console.error('Erreur calculateTotalAcceptedPrice:', error);
    throw error;
  }
};