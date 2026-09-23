import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';
import { loginEntreprise } from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Icônes modernes

type LoginEProps = {
  navigation: NavigationProp<any>;
};

const LoginE: React.FC<LoginEProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, setToken, setUserType } = useContext(AuthContext);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await loginEntreprise({ email, password });

      if (response?.token && response?.entreprise?.id) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_id', response.entreprise.id.toString());
        await AsyncStorage.setItem('user_type', 'entreprise');

        setToken(response.token);
        setUserType('entreprise');
        setIsLoggedIn(true);
      setSuccess('Connexion réussie');
        navigation.navigate('Home', {
          screen: 'ChoisiTypeGroup',
          params: {
            screen: 'HelloPage2',
          },
        });
      } else {
       setError('Réponse invalide du serveur');
      }
    } catch (error) {
     setError((error as any).message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground style={styles.background}>
      {/* Formes décoratives */}
      <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.topLeftLower]} />
      <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
      <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.bottomRight]} />
 <Image source={require('../assets/logo.png')} style={styles.logo} />
    {success ? (
  <View style={styles.successContainer}>
    <Image source={require('../assets/iconn.png')} style={styles.successIcon} />
    <Text style={styles.successText}>{success}</Text>
    <TouchableOpacity onPress={() => setSuccess('')}>
 </TouchableOpacity>
  </View>
) : null}
{error ? (
  <View style={styles.alertContainer}>
    <Text style={styles.alertText}>{error}</Text>
    <TouchableOpacity onPress={() => setError('')}>
      <Icon name="close" size={20} color="#721c24" />
    </TouchableOpacity>
  </View>
) : null}
      <View style={styles.container}>
        <Text style={styles.title}>Connexion Entreprise</Text>
        <Text style={styles.subtitle}>Bienvenue sur Loisir Hub ! ❤️</Text>

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
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordE')}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Indicateur de chargement */}
        {loading && <ActivityIndicator size="large" color="#8EB6AD" />}

        {/* Bouton Connexion */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  successContainer: {
  backgroundColor: '#d4edda',
  borderRadius: 8,
  padding: 12,
  marginVertical: 12,
  borderWidth: 1,
  borderColor: '#c3e6cb',
  flexDirection: 'row',
  alignItems: 'center',
},
successText: {
  color: '#155724',
  fontWeight: 'bold',
  fontSize: 15,
  flex: 1,
  marginLeft: 8,
},
successIcon: {
  width: 24,
  height: 24,
  marginRight: 8,
},
  alertContainer: {
  backgroundColor: '#f8d7da',
  borderRadius: 8,
  padding: 12,
  marginVertical: 12,
  borderWidth: 1,
  borderColor: '#f5c6cb',
  flexDirection: 'row',
  alignItems: 'center',
},
alertText: {
  color: '#721c24',
  fontWeight: 'bold',
  fontSize: 15,
  flex: 1,
},
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
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
  decorImage: {
    position: 'absolute',
    width: 390,
    height: 290,
  },
  topLeft: {
    top: -120,
    left: -110,
  },
  topLeftLower: {
    top: -100,
    left: -100,
  },
  bottomRight: {
    bottom: -50,
    right: -130,
  },
});

export default LoginE;