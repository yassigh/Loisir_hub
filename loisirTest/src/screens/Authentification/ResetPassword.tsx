import React, { useState } from 'react';
import { View, TextInput, ImageBackground, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

// Définition du type de navigation
type RootStackParamList = {
  PasswordCode: { email: string };
};

const ResetPassword = () => {
  const [email, setEmail] = useState(''); // Déclarez l'état pour l'email
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleResetPassword = async () => {
    try {
      // Envoi de l'email à la route forgot-password
      const response = await axios.post('http://192.168.100.122:8001/api/user/forgot-password', {
        email: email,
      });
      console.log('Réinitialisation demandée:', response.data);
      navigation.navigate('PasswordCode', { email }); 
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande de réinitialisation:', error);
    }
  };

  return (
    <ImageBackground style={styles.background}>
      {/* Formes décoratives */}
      <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.topLeftLower]} />
      <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
      <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.bottomRight]} />
  
      <Image source={require('../assets/logo.png')} style={styles.logo} />
  
      <Text style={styles.emailLabel}>Email:</Text>
  
      <TextInput
        style={styles.input}
        placeholder="Votre Email"
        placeholderTextColor="#dcdcdc"
        value={email} // Remplacer password par email
        onChangeText={setEmail} // Utiliser setEmail pour mettre à jour l'état
      />
  
      <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  logo: {
    width: 150,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 10,
    textAlign: 'center',
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
    alignSelf: 'flex-start',
    paddingLeft: 20,
  },
  input: {
    width: '90%',
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  resetButton: {
    backgroundColor: '#4A7C87',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
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

export default ResetPassword;
