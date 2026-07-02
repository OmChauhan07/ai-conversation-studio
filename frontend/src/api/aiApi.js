import axios from 'axios';

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000',
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

aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions for Knowledge Base
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Note: let browser set Content-Type for FormData automatically with boundary
  const response = await aiApi.post('/knowledge/upload', formData);
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
export const sendChatMessage = async (message, conversationId = null) => {
  const response = await aiApi.post('/chat/', { message, conversationId });
  return response.data;
};

// Helper function for Retrieval Search
export const searchKnowledge = async (query) => {
  const response = await aiApi.post('/retrieval/search', { query });
  return response.data;
};

// Admin Stats
export const fetchAdminStats = async () => {
  const response = await aiApi.get('/admin/stats');
  return response.data;
};

// Conversation History
export const fetchConversations = async () => {
  const response = await aiApi.get('/chat/conversations');
  return response.data;
};

export const fetchConversationMessages = async (id) => {
  const response = await aiApi.get(`/chat/conversations/${id}`);
  return response.data;
};

export const deleteConversation = async (id) => {
  const response = await aiApi.delete(`/chat/conversations/${id}`);
  return response.data;
};

// Prompt Testing
export const testPrompt = async (data) => {
  const response = await aiApi.post('/prompts/test', data);
  return response.data;
};

// Feedback
export const getFeedbackList = async () => {
  const response = await aiApi.get('/feedback/');
  return response.data;
};

export const submitFeedback = async (data) => {
  const response = await aiApi.post('/feedback/', data);
  return response.data;
};

// Prompts
export const fetchPrompts = async () => {
  const response = await aiApi.get('/prompts/');
  return response.data;
};

export const createPrompt = async (promptData) => {
  const response = await aiApi.post('/prompts/', promptData);
  return response.data;
};

export const updatePrompt = async (id, promptData) => {
  const response = await aiApi.put(`/prompts/${id}`, promptData);
  return response.data;
};

export const deletePrompt = async (id) => {
  const response = await aiApi.delete(`/prompts/${id}`);
  return response.data;
};

export const runPrompt = async (promptId, variables = {}) => {
  const response = await aiApi.post('/prompts/run', { promptId, variables });
  return response.data;
};

export default aiApi;
