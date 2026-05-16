import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return !!(token && role);
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('user');
      }
    }
    return role ? { role } : null;
  });

  const login = (token, role = 'Employee', userData = null) => {
    const sessionUser = userData || { role };
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setIsAuthenticated(true);
    setUser(sessionUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
