import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 secondes timeout
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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Erreur réseau - Vérifiez que le serveur backend est démarré');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTIFICATION ====================
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// ==================== UTILISATEURS ====================
export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ==================== ZONES ====================
export const getZones = () => api.get('/zones');
export const createZone = (zone) => api.post('/zones', zone);
export const updateZone = (id, zone) => api.put(`/zones/${id}`, zone);
export const deleteZone = (id) => api.delete(`/zones/${id}`);

// ==================== PRODUITS ====================
export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ==================== MOUVEMENTS ====================
export const getMovements = () => api.get('/movements');
export const getMovementsByType = (type) => api.get(`/movements/type/${type}`);
export const getMovementStats = () => api.get('/movements/stats');
export const getMovementById = (id) => api.get(`/movements/${id}`);
export const createInMovement = (data) => api.post('/movements/in', data);
export const createOutMovement = (data) => api.post('/movements/out', data);
export const createTransferMovement = (data) => api.post('/movements/transfer', data);
export const cancelMovement = (id) => api.put(`/movements/${id}/cancel`);

// ==================== ALERTES IA ====================
export const getAIProductAlerts = () => api.get('/ai-alerts/products');
export const getAIZoneAlerts = () => api.get('/ai-alerts/zones');
export const getAIAnomalies = () => api.get('/ai-alerts/anomalies');
export const getAIDashboardAlerts = () => api.get('/ai-alerts/dashboard');

// ==================== DASHBOARD ====================
export const getDashboardKPIs = () => api.get('/dashboard/kpis');
export const getMovementChartData = () => api.get('/dashboard/movement-chart');
export const getZoneChartData = () => api.get('/dashboard/zone-chart');
export const getRecentAlerts = () => api.get('/dashboard/recent-alerts');
export const getFullDashboard = () => api.get('/dashboard/full');

// ==================== CHAT IA ====================
export const sendChatMessage = (data) => api.post('/chat/send', data);
export const getChatHistory = () => api.get('/chat/history');
export const getChatSuggestions = () => api.get('/chat/suggestions');

// ==================== RAPPORTS PDF ====================
// Exports PDF (avec responseType blob)
export const getInventoryPDF = (period = 'month') => {
  return api.get(`/reports/inventory/pdf?period=${period}`, {
    responseType: 'blob'
  });
};

export const getMovementsPDF = (startDate, endDate) => {
  let url = '/reports/movements/pdf';
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  return api.get(url, { responseType: 'blob' });
};

export const getAlertsPDF = () => {
  return api.get('/reports/alerts/pdf', { responseType: 'blob' });
};

// Aperçus (sans PDF)
export const getInventoryPreview = (period = 'month') => {
  return api.get(`/reports/inventory/preview?period=${period}`);
};

export const getMovementsPreview = (startDate, endDate) => {
  let url = '/reports/movements/preview';
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  return api.get(url);
};

export const getAlertsPreview = () => {
  return api.get('/reports/alerts/preview');
};

// ==================== INVENTAIRE CALENDRIER ====================
export const runAutoInventory = (period = 'month') => {
  return api.get(`/inventory-calendar/run?period=${period}`);
};

export const getInventoryPreviewAuto = (period = 'month') => {
  return api.get(`/inventory-calendar/preview?period=${period}`);
};

export const getInventoryHistory = () => {
  return api.get('/inventory-calendar/history');
};

// ==================== ALERTES SIMPLES ====================
export const getAlerts = () => api.get('/alerts');

export default api;