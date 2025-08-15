import React, { createContext, useContext, useState, useEffect } from 'react';
import { userServices } from '../api/userServices';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      if (userServices.isAuthenticated()) {
        try {
          const userData = await userServices.getProfile();
          if (userData) {
            setUser(userData.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          await userServices.logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await userServices.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    setIsLoading(true);
    try {
      const response = await userServices.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await userServices.logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData, isPartial = false) => {
    setIsLoading(true);
    try {
      const response = await userServices.updateProfile(profileData, isPartial);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    return await userServices.changePassword(passwordData);
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!isAuthenticated) return null;

    try {
      const response = await userServices.getProfile();
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
      return null;
    }
  };

  // Check email availability
  const checkEmailAvailability = async (email) => {
    return await userServices.checkEmailAvailability(email);
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    return await userServices.checkUsernameAvailability(username);
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,

    // Auth methods
    login,
    signup,
    logout,

    // Profile methods
    updateProfile,
    changePassword,
    refreshUser,

    // Utility methods
    checkEmailAvailability,
    checkUsernameAvailability,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
