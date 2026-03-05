import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/api';

export const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte facilement
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await auth.login(credentials);
      // Le backend retourne { token, refreshToken, user }
      const { token, refreshToken, user } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Retourner le rôle pour que le composant Login puisse rediriger
      return { success: true, role: user.role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion'
      };
    }
  };

  const register = async (formData) => {
    try {
      // formData peut être FormData (avec fichiers) ou objet JSON (donor)
      const response = await auth.register(formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return {
        success: true,
        requiresVerification: response.data.requiresVerification
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur d\'inscription'
      };
    }
  };

  const verifyPhone = async (data) => {
    try {
      const response = await auth.verifyPhone(data);
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Code incorrect'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Redirection selon le rôle
  const getHomeByRole = (role) => {
    switch (role) {
      case 'admin':     return '/admin';
      case 'validator': return '/validator';
      case 'partner':   return '/partner';
      case 'donor':     return '/donor';
      default:          return '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      verifyPhone,
      logout,
      getHomeByRole,
      isAdmin: user?.role === 'admin',
      isValidator: user?.role === 'validator',
      isPartner: user?.role === 'partner',
      isDonor: user?.role === 'donor',
    }}>
      {children}
    </AuthContext.Provider>
  );
};