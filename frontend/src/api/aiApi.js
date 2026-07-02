import axios from 'axios';

const aiBaseURL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

// Create a dedicated axios instance for the FastAPI AI backend
const aiApi = axios.create({
  baseURL: aiBaseURL,
});

// Automatically attach the JWT token to every request if it exists
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Upload a document to the knowledge base.
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} - { success, filename, chunks_created, message }
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await aiApi.post('/knowledge/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Fetch all documents from the knowledge base.
 * @returns {Promise<Object>} - { success, count, documents: [...] }
 */
export const getDocuments = async () => {
  const response = await aiApi.get('/knowledge/documents');
  return response.data;
};

/**
 * Delete a document from the knowledge base by filename.
 * @param {string} filename - The filename to delete
 * @returns {Promise<Object>} - { success, message }
 */
export const deleteDocument = async (filename) => {
  const response = await aiApi.delete(`/knowledge/${encodeURIComponent(filename)}`);
  return response.data;
};

/**
 * Send a chat message and receive a grounded AI response.
 * @param {string} message - The user message
 * @returns {Promise<Object>} - { success, answer, sources, provider }
 */
export const chat = async (message) => {
  const response = await aiApi.post('/chat/', { message });
  return response.data;
};

/**
 * Search the knowledge base for relevant chunks.
 * @param {string} query - The search query
 * @returns {Promise<Object>} - { chunks: [...] }
 */
export const searchKnowledge = async (query) => {
  const response = await aiApi.post('/retrieval/search', { query });
  return response.data;
};

export default aiApi;
