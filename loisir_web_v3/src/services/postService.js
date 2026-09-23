import { api } from './api';

export const getAllPostsForAdmin = async () => {
  try {
    const response = await api.get('/admin/postes');
    return response.data.postes;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllPosts = async (categorieId = null) => {
  try {
    const params = categorieId ? { categorie_id: categorieId } : {};
    const response = await api.get('/postes', { params });
    return response.data.postes;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPostById = async (id) => {
  try {
    const response = await api.get(`/postes/${id}`);
    return response.data.poste;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addPost = async (postData) => {
  try {
    const response = await api.post('/postes', postData);
    console.log('Post API Response:', response.data);
    
    const postId = response.data.id || 
                  response.data.poste?.id;
    
    if (postId) {
      return {
        id: postId,
        ...response.data.poste
      };
    }
    
    throw new Error('Post ID not found in response');
  } catch (error) {
    console.error('Add post error:', error);
    throw error;
  }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await api.put(`/postes/${id}`, postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePost = async (id) => {
  try {
    const response = await api.delete(`/postes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEnterprisePosts = async () => {
  try {
    const response = await api.get('/entreprise/postes');
    return response.data.postes;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePosteStatus = async (id, status) => {
  try {
    const response = await api.put(`/postes/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};