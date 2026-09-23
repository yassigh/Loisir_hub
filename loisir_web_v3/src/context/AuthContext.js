import React, { createContext, useState, useContext, useEffect } from 'react';
import { validateToken,loginUser,loginEntreprise } from '../services/authService';
import { authApi } from '../services/api';

//v2.0
const AuthContext = createContext();
//v1.0
// const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  //v2.0
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //v1.0
  // const [user, setUser] = useState(() => {
  //   const token = localStorage.getItem('auth_token');
  //   const userType = localStorage.getItem('user_type');
  //   if (token && userType) {
  //     return { type: userType };
  //   }
  //   return null;
  // });
  // const [loading, setLoading] = useState(true);
  //v2.0 useeffect
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userType = localStorage.getItem('user_type');
      
      if (token && userType) {
        setUser({
          token,
          type: userType
        });
      }
      setLoading(false);
    };

    initAuth();
  }, []);
//v1.0 useeffect
  // useEffect(() => {
  //   const validateUserSession = async () => {
  //     const token = localStorage.getItem('auth_token');
  //     if (token) {
  //       try {
  //         const response = await validateToken();
  //         setUser(response.user); // Mettre à jour l'état avec les données de l'utilisateur
  //       } catch (error) {
  //         console.error('Token validation failed:', error);
  //         logout(); // Déconnecter l'utilisateur en cas d'échec de validation
  //       }
  //     }
  //     setLoading(false);
  //   };

  //   validateUserSession();
  // }, []);

  //v2.0
  const login = async (credentials) => {
    try {
      // Use the correct login endpoint based on user type
      const loginFunction = credentials.userType === 'user' ? loginUser : loginEntreprise;
      const response = await loginFunction(credentials);
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_type', response.user.type || response.user.role);
        
        setUser({
          token: response.token,
          type: response.user.type || response.user.role
        });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
  //v1.0 login marche correctement 
  // const login = (userData) => {
  //   setUser(userData); // Mettre à jour l'état de l'utilisateur
  //   localStorage.setItem('auth_token', userData.token); // Stocker le token
  //   localStorage.setItem('user_type', userData.type || userData.role); // Stocker le type d'utilisateur
  // };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};