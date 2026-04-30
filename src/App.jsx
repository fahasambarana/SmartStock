import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Zones from './pages/Zones';
import Movements from './pages/Movements';
import Alerts from './pages/Alerts';
import Users from './pages/Users';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import InventoryCalendar from './components/InventoryCalendar';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        
        {/* Routes protégées avec DashboardLayout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/zones" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <DashboardLayout>
              <Zones />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'utilisateur']}>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/movements" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'utilisateur']}>
            <DashboardLayout>
              <Movements />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/alerts" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'utilisateur', 'fournisseur']}>
            <DashboardLayout>
              <Alerts />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* ⚠️ CORRECTION ICI : Ajouter DashboardLayout et ProtectedRoute */}
        <Route path="/inventory-calendar" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <DashboardLayout>
              <InventoryCalendar />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;