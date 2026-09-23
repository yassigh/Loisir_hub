import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  PasswordCodeE: { email?: string };
  NewPasswordE: { email?: string; resetCode?: string };
};

const PasswordCodeE = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'PasswordCodeE'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PasswordCodeE'>>();
  
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const email = route.params?.email;

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

    if (!email) {
      setErrorMessage("L'email est manquant.");
      return;
    }

    try {
      const response = await axios.post('http://192.168.100.122:8001/api/entreprise/verify-reset-code', {
        reset_code: resetCode,
        email: email,
      });

      if (response.data) {
        // Vérifier que email et resetCode existent avant de naviguer
        if (email && resetCode) {
          navigation.navigate('NewPasswordE', { email, resetCode });
        } else {
          setErrorMessage("Des informations sont manquantes.");
        }
      } else {
        setErrorMessage("Code invalide, veuillez réessayer.");
      }
    } catch (error) {
      setErrorMessage("Erreur lors de la vérification du code.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Entrez le code de réinitialisation</Text>
      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.pinDigit}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(value) => handlePinChange(value, index)}
          />
        ))}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleVerifyResetCode}>
        <Text style={styles.buttonText}>Vérifier le code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 20,
    textAlign: 'center',
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
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4A7C87',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
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
  bottomRight: {
    bottom: -50,
    right: -130,
  },
});

export default PasswordCodeE;
