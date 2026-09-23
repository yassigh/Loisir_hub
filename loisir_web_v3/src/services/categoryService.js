import { api,authApi } from './api';


export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data.categories;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add this new function to your existing categoryService.js
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const addCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// export const deleteCategory = async (id) => {
//   try {
//     const token = localStorage.getItem('auth_token');
//     await authApi.delete(`/categories/${id}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`); // Updated endpoint
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};