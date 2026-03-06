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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/zones" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><DashboardLayout><Zones /></DashboardLayout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}><DashboardLayout><Products /></DashboardLayout></ProtectedRoute>} />
        <Route path="/movements" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}><DashboardLayout><Movements /></DashboardLayout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee', 'Viewer']}><DashboardLayout><Alerts /></DashboardLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><Users /></DashboardLayout></ProtectedRoute>} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
