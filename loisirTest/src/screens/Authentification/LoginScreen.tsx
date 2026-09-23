import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Icônes modernes
import { Linking } from 'react-native';
import GoogleSignInButton from './GoogleSignInButton';


type LoginScreenProps = {
  navigation: NavigationProp<any>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, setToken, setUserType } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({ email, password });

      if (response?.token && response?.user?.id) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_id', response.user.id.toString());
        await AsyncStorage.setItem('user_type', 'user');
        setToken(response.token);
        setUserType('user');
        setIsLoggedIn(true);
        Alert.alert('Succès', 'Connexion réussie');
        navigation.navigate('Home', {
          screen: 'ChoisiTypeGroup',
          params: {
            screen: 'SelectInterests',
          },
        });
      } else {
        Alert.alert('Erreur', 'Réponse invalide du serveur');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground style={styles.background}>
      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <View style={styles.container}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Content de vous revoir ! ❤️</Text>

        {/* Champ Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Champ Mot de passe */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Lien Mot de passe oublié */}
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Indicateur de chargement */}
        {loading && <ActivityIndicator size="large" color="#8EB6AD" />}

        {/* Bouton Connexion */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <GoogleSignInButton />
        {/* <TouchableOpacity
  style={styles.googleButton}
  onPress={() => navigation.navigate('GoogleSignIn')} // Ajouter cette route dans votre Stack Navigator
>
  <Image source={require('../assets/google.png')} style={styles.googleIcon} />
  <Text style={styles.googleButtonText}>Continuer avec Google</Text>
</TouchableOpacity> */}
      </View>
    </ImageBackground>
  );
};

// Fonction pour gérer la connexion
const loginUser = async ({ email, password }: { email: string; password: string }) => {
  try {
    const response = await fetch('http://192.168.100.122:8001/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const styles = StyleSheet.create({
  googleButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 20,
  marginTop: 20,
  justifyContent: 'center',
},
googleIcon: {
  width: 24,
  height: 24,
  marginRight: 10,
},
googleButtonText: {
  color: '#333',
  fontSize: 16,
  fontWeight: 'bold',
},
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  logo: {
    width: 120,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  container: {
    width: '85%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  forgotPasswordText: {
    color: '#D7A738',
    fontSize: 14,
    alignSelf: 'flex-end',
    marginBottom: 15,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#4A7C87',
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;