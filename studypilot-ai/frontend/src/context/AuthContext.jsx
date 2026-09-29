import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sp_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => setUser(data.data))
      .catch(() => {
        localStorage.removeItem('sp_access_token');
        localStorage.removeItem('sp_refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('sp_access_token', data.data.accessToken);
    localStorage.setItem('sp_refresh_token', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const signup = async (name, email, password) => {
    const { data } = await authApi.signup({ name, email, password });
    localStorage.setItem('sp_access_token', data.data.accessToken);
    localStorage.setItem('sp_refresh_token', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('sp_refresh_token');
    try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    localStorage.removeItem('sp_access_token');
    localStorage.removeItem('sp_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
