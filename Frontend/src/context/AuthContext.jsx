// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('public');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Normalize role to lowercase
      setCurrentUser({ ...user, role: (user.rol || user.role)?.toLowerCase() });
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('public');
    }
    setIsInitialized(true);
  }, []);

  const handleLogin = (user) => {
    // Normalize role to lowercase
    const normalizedUser = { ...user, role: (user.rol || user.role)?.toLowerCase() };
    setCurrentUser(normalizedUser);
    localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
    localStorage.setItem('authToken', user.token || ''); // Store token if provided
    setCurrentPage('dashboard');
    return normalizedUser; // Return user for role-based tab selection
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setCurrentPage('public');
    const darkMode = localStorage.getItem('darkMode');
    localStorage.setItem('publicDarkMode', darkMode);
  };

  const showAuthPage = () => {
    setCurrentPage('auth');
  };

  const showPublicPage = () => {
    setCurrentPage('public');
  };

  if (!isInitialized) return null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentPage,
        handleLogin,
        handleLogout,
        showAuthPage,
        showPublicPage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};