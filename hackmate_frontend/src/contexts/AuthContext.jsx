
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoading(true);
      axios.get('http://localhost:8000/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('authToken');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/auth/login/', {
        email,
        password
      });
      const { access, refresh, user } = res.data;
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);
      setUser(user);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (userData) => {
    setIsLoading(true);
    try {
      // Register user
      await axios.post('http://localhost:8000/auth/register/', {
        email: userData.email,
        password: userData.password,
        username: userData.name
      });
      // Login after signup
      await login(userData.email, userData.password);
      // Optionally, update profile (skills, interests, etc.)
      // await axios.put('http://localhost:8000/users/profile/me/', {
      //   ...userData
      // }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put('http://localhost:8000/users/profile/me/', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
