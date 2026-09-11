import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dms_token'));
  const [loading, setLoading] = useState(true);

  // On mount, if token exists, fetch user profile
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  /**
   * Login — supports optional role parameter for admin login page
   * @param {string} email
   * @param {string} password
   * @param {string} [role] - 'admin' or 'student' (optional, sent to backend for role verification)
   */
  const login = async (email, password, role) => {
    const payload = { email, password };
    if (role) payload.role = role;

    const res = await API.post('/auth/login', payload);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('dms_token', newToken);
    localStorage.setItem('dms_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('dms_token', newToken);
    localStorage.setItem('dms_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('dms_token');
    localStorage.removeItem('dms_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
