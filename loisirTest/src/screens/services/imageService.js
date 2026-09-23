//src/screens/services/imageService.js
import { api, authApi } from './Api';

const AUTH_BASE_URL = 'http://192.168.100.122:8001/api';
const LOISIR_BASE_URL = 'http://192.168.100.122:8000';

// Auth Service Functions
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', {
    uri: file.uri,
    type: file.type,
    name: file.fileName || 'image.jpg',
  });

  try {
    const response = await authApi.post('/user/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getImageUrl = (path) => {
  return `${AUTH_BASE_URL}/storage/${path}`;
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', {
    uri: file.uri,
    type: file.type,
    name: file.fileName || 'logo.jpg',
  });

  try {
    const response = await authApi.post('/entreprise/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Loisir Service Functions
export const getLoisirImageUrl = (path) => {
  if (!path) return null;
  
  console.log('Raw image URL:', path);
  
  // Si l'URL est déjà complète, la retourner
  if (path.startsWith('http://')) {
      return path;
  }
  
  // Nettoyer le chemin et construire l'URL complète
  const cleanPath = path.replace(/^storage\//, '').replace(/^\/?/, '');
  const fullUrl = `${LOISIR_BASE_URL}/storage/${cleanPath}`;
  
  console.log('Processed image URL:', fullUrl);
  return fullUrl;
};
const BASE_URL = 'http://192.168.100.122:8000/storage'; // Base URL pour accéder aux images

export const generateImageUrl = (path) => {
  if (!path || typeof path !== 'string') {
    console.error('Chemin de l\'image invalide ou non défini :', path);
    return null; // Retourne null si le chemin est vide ou invalide
  }

  // Si l'URL est déjà complète, la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Construire l'URL complète
  const BASE_URL = 'http://192.168.100.122:8000/storage';
  const fullUrl = `${BASE_URL}/${path.replace(/^\/+/, '')}`;
  console.log('URL générée pour l\'image :', fullUrl);
  return fullUrl;
};
 
export const uploadImageForEntity = async (file, type, id) => {
  const formData = new FormData();
  formData.append('image', {
    uri: file.uri,
    type: file.type,
    name: file.fileName || 'image.jpg',
  });

  try {
    const response = await api.post(`/${type}/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

export const getImagesForEntity = async (type, id) => {
  try {
    const response = await api.get(`/${type}/${id}/images`);
    return response.data.images.map(image => ({
      ...image,
      url: image.url.replace(`${LOISIR_BASE_URL}/storage/`, '') // Nettoyer l'URL
    }));
  } catch (error) {
    console.error('Get images error:', error);
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

// Helper Functions
export const uploadActivityImage = async (file, activityId) => {
  return uploadImageForEntity(file, 'activites-payantes', activityId);
};

export const uploadEventImage = async (file, eventId) => {
  return uploadImageForEntity(file, 'evenements', eventId);
};

export const uploadPostImage = async (file, postId) => {
  return uploadImageForEntity(file, 'postes', postId);
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 2 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, JPEG and PNG are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 2MB.');
  }

  return true;
};
export const getEntityImageUrl = (path, type) => {
  if (!path) return null;

  // Si l'URL est déjà complète, la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Construire l'URL complète
  return `http://192.168.100.122:8000/storage/${path.replace(/^\/+/, '')}`;
};
export const getEntityImageUrlq = (path, type) => {
  if (!path) return null;

  // Si l'URL est déjà complète, la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Construire l'URL complète pour le port 8001
  return `http://192.168.100.122:8001/storage/${path.replace(/^\/+/, '')}`;
};
export const getEntityImageUrla = (path) => {
  if (!path) return null; // Retourne null si le chemin est vide

  // Si l'URL est déjà complète, la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Construire l'URL complète pour le port 8001
  return `http://192.168.100.122:8001/storage/${path.replace(/^\/+/, '')}`;
};
// Fonction pour uploader une image de profil (utilisateur ou entreprise)
export const uploadProfileImage = async (file, type) => {
  const formData = new FormData();
  formData.append(type === 'user' ? 'image' : 'logo', {
    uri: file.uri,
    type: file.type,
    name: file.fileName || `${type}-profile.jpg`,
  });

  try {
    const endpoint = type === 'user' ? '/user/upload-image' : '/entreprise/upload-logo';
    const response = await authApi.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image de profil:', error);
    throw error.response?.data || error;
  }
};
export const getFullImageUrl = (path) => {
  if (!path) {
    return 'http://192.168.100.122:8001/default-logo.png'; // URL par défaut pour les logos manquants
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Retourne l'URL si elle est déjà complète
  }
  return `http://192.168.100.122:8001/storage/${path.replace(/^\/+/, '')}`; // Construire l'URL complète
};
