import axios from 'axios';

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the JWT token from localStorage
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper functions for Knowledge Base
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Note: let browser set Content-Type for FormData
  const response = await aiApi.post('/knowledge/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchDocuments = async () => {
  const response = await aiApi.get('/knowledge/documents');
  return response.data;
};

export const deleteDocument = async (filename) => {
  const response = await aiApi.delete(`/knowledge/${filename}`);
  return response.data;
};

// Helper function for Chat
export const sendChatMessage = async (message) => {
  const response = await aiApi.post('/chat/', { message });
  return response.data;
};

// Helper function for Retrieval Search
export const searchKnowledge = async (query) => {
  const response = await aiApi.post('/retrieval/search', { query });
  return response.data;
};

export default aiApi;
