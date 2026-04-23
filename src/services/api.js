import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
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

// Gestion des produits
export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Gestion des zones
export const getZones = () => api.get('/zones');
export const createZone = (zone) => api.post('/zones', zone);
export const updateZone = (id, zone) => api.put(`/zones/${id}`, zone);
export const deleteZone = (id) => api.delete(`/zones/${id}`);

// Gestion des mouvements
export const getMovements = () => api.get('/movements');
export const createMovement = (movement) => api.post('/movements', movement);

// Gestion des alertes
export const getAlerts = () => api.get('/alerts');

// Gestion des utilisateurs
export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Authentification
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

export default api;