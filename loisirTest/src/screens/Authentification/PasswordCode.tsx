import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native'; // Importation de useRoute
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// ✅ Définition du type des routes
type RootStackParamList = {
  PasswordCode: { email?: string };  // Le type des paramètres de la route inclut email
  NewPassword: { email?: string; resetCode?: string }; 
};

type PasswordCodeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PasswordCode'>;
type PasswordCodeScreenRouteProp = RouteProp<RootStackParamList, 'PasswordCode'>; // Définir le type de la route

const PasswordCode = () => {
  const navigation = useNavigation<PasswordCodeScreenNavigationProp>(); 
  const route = useRoute<PasswordCodeScreenRouteProp>();  // Utilisation de useRoute pour récupérer les paramètres de la route
  
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const email = route.params.email; // Accès à l'email passé par la navigation

  const handlePinChange = (value: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
  };

  const handleVerifyResetCode = async () => {
    const resetCode = pin.join('');

    if (resetCode.length !== 6) {
      setErrorMessage("Le code doit contenir 6 chiffres.");
      return;
    }
    const email = route.params.email;
    try {
      const response = await axios.post('http://192.168.100.122:8001/api/user/verify-reset-code', {
        reset_code: resetCode,
        email: email, 
      });
      
      if (response.data) {
        console.log('Code vérifié avec succès');
        console.log('Navigating to NewPassword with:', { email, resetCode });
        navigation.navigate('NewPassword', { email, resetCode });
        
        console.log('Navigating to NewPassword with:', { email, resetCode });
        console.log('Email reçu dans PasswordCode:', route.params?.email);

      // Utilisation correcte de la navigation
      } else {
        setErrorMessage("Code invalide, veuillez réessayer.");
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification du code:', error.response?.data);

      if (error.response) {
        setErrorMessage(error.response?.data?.message || "Erreur lors de la vérification du code.");
      } else {
        setErrorMessage("Problème de connexion au serveur.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
      <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.bottomRight]} />
      <Text style={styles.HelloLabel}>Hello!</Text>
      <Text>Type your code</Text>

      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.pinDigit}
            maxLength={1}
            keyboardType="numeric"
            secureTextEntry
            value={digit}
            onChangeText={(value) => handlePinChange(value, index)}
          />
        ))}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.userAction}>
        <TouchableOpacity>
          <Text style={styles.actionText}>Not you?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imageButton} onPress={handleVerifyResetCode}>
          <Image source={require('../assets/right.png')} style={styles.buttonImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  HelloLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A7C87',
    textAlign: 'center',
    marginBottom: 10,
  },
  pinContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  pinDigit: {
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    width: 50,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  userAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  actionText: {
    fontSize: 15,
    color: '#4A7C87',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  imageButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    backgroundColor: '#4A7C87',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonImage: {
    width: 30,
    height: 30,
    tintColor: '#FFF',
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
  bottomRight: {
    bottom: -50,
    right: -130,
  },
});

export default PasswordCode;
// function useRoute<T>() {
//   throw new Error('Function not implemented.');
// }

