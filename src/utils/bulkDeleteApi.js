import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bulk delete API functions
export const bulkDeleteApi = {
  // Delete posts
  deletePosts: async (ids) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/posts', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete cards
  deleteCards: async (ids) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/cards', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete table posts
  deleteTablePosts: async (ids) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/table-posts', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete table structures
  deleteTableStructures: async (ids) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/table-structures', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete categories
  deleteCategories: async (ids, force = false) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/categories', {
        data: { ids, force },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete subcategories
  deleteSubcategories: async (ids, force = false) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/subcategories', {
        data: { ids, force },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete social media links
  deleteSocialMedia: async (ids) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/social-media', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete header components
  deleteHeaderComponents: async (ids) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/header-components', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Universal bulk delete
  universalDelete: async (contentType, ids, force = false) => {
    try {
      const response = await apiClient.delete('/api/bulk-delete/universal', {
        data: { contentType, ids, force },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get content statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/bulk-delete/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default bulkDeleteApi;
