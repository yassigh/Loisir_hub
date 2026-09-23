import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  token: string | null;
  userType: string | null;
  setToken: (value: string | null) => void;
  setUserType: (value: string | null) => void;
   entreprise?: {
    id: number;
    nomE: string;
    // ajoute d'autres propriétés si besoin
  } | null;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  token: null,
  userType: null,
  setToken: () => {},
  setUserType: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUserType = await AsyncStorage.getItem('user_type');
      setToken(storedToken);
      setUserType(storedUserType);
      setIsLoggedIn(!!storedToken);
    };

    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, token, userType, setToken, setUserType }}>
      {children}
    </AuthContext.Provider>
  );
};