import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptors if needed for auth tokens

export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getZones = () => api.get('/zones');
export const createZone = (zone) => api.post('/zones', zone);
export const updateZone = (id, zone) => api.put(`/zones/${id}`, zone);
export const deleteZone = (id) => api.delete(`/zones/${id}`);

export const getMovements = () => api.get('/movements');
export const createMovement = (movement) => api.post('/movements', movement);

export const getAlerts = () => api.get('/alerts');

export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;