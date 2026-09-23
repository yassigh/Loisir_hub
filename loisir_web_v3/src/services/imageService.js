// src/services/imageService.js
import { authApi,api } from './api';
const AUTH_BASE_URL = 'http://127.0.0.1:8001/api'; // Auth Service
const LOISIR_BASE_URL = 'http://127.0.0.1:8000'; // Remplacer par votre URL locale

// Télécharger une image
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await authApi.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer une image
export const getImageUrl = (path) => {
  return `${AUTH_BASE_URL}/storage/${path}`;
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);

  try {
    const response = await authApi.post('/entreprise/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

//Entity image 
// Upload image for different types (activities, events, posts)
// Get image URL for Loisir service
//v2.0
export const getLoisirImageUrl = (path) => {
  if (!path) return null;
  // Éviter la double URL
  if (path.includes('http://')) {
    return path;
  }
  // Nettoyer le chemin
  const cleanPath = path.replace(/^storage\//, '');
  return `${LOISIR_BASE_URL}/storage/${cleanPath}`;
};
//v1.0
// export const getLoisirImageUrl = (path) => {
//   if (!path) return null;
//   // Vérifier si path contient déjà 'storage/'
//   if (path.startsWith('storage/')) {
//     return `${LOISIR_BASE_URL}/${path}`;
//   }
//   return `${LOISIR_BASE_URL}/storage/${path}`;
// };


// Helper functions for specific entity types
export const uploadActivityImage = async (file, activityId) => {
  return uploadImageForEntity(file, 'activites-payantes', activityId);
};

export const uploadEventImage = async (file, eventId) => {
  return uploadImageForEntity(file, 'evenements', eventId);
};

export const uploadPostImage = async (file, postId) => {
  return uploadImageForEntity(file, 'postes', postId);
};

export const uploadAdvertisementImage = async (file, advertisementId) => {
  return uploadImageForEntity(file, 'publicites', advertisementId);
};


// Image validation helpers
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, JPEG and PNG are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 2MB.');
  }

  return true;
};

// Utility function to get entity image URL
export const getEntityImageUrl = (path, type) => {
  if (!path) return null;
  return `${LOISIR_BASE_URL}/storage/${path}`; 
};

// export const getImagesForEntity = async (type, id) => {
//   try {
//     const response = await api.get(`/${type}/${id}/images`);
//     return response.data.images.map(image => ({
//       ...image,
//       // Ne pas transformer l'URL ici car elle est déjà correctement formatée
//       url: image.url
//     }));
//   } catch (error) {
//     console.error('Get images error:', error);
//     throw error.response?.data || error;
//   }
// };

export const uploadImageForEntity = async (file, type, id) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post(`/${type}/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Assurer que l'URL de l'image est correctement formatée
    const image = response.data.image;
    return {
      ...response.data,
      image: {
        ...image,
        url: image.url.replace(`${LOISIR_BASE_URL}/storage/`, '')
      }
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data || error;
  }
};

export const deleteImage = async (imageId) => {
  try {
    const response = await api.delete(`/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error.response?.data || error;
  }
  
};
export const getImagesForEntity = async (entityType, entityId) => {
  try {
    const response = await api.get(`/${entityType}/${entityId}/images`);
    return response.data.images;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};