import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';

// Définition du type pour la navigation
type RootStackParamList = {
  LoginE: undefined;
  NewPasswordE: { email: string};
};

const NewPasswordE = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'NewPasswordE'>>();
  const route = useRoute();
  const routeParams = route.params as { email?: string; resetCode?: string };
  const email = routeParams?.email ?? '';
  const resetCode = routeParams?.resetCode ?? '';
  console.log('Email reçu dans NewPassword:', routeParams?.email);
  console.log('Reset Code reçu dans NewPassword:', routeParams?.resetCode);
   
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ajout pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSavePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://192.168.100.122:8001/api/entreprise/reset-password', {
        email,
        reset_code: resetCode,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.data) {
        Alert.alert('Succès', 'Votre mot de passe a été réinitialisé avec succès.');
        navigation.navigate('LoginE');
      } else {
        Alert.alert('Erreur', response.data.message || 'Une erreur est survenue.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while resetting the password.');
           
            } finally {
      setIsLoading(false);
    }
  };

  return (
   <View style={styles.container}>
         {/* Background Images */}
         <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.topLeft]} />
         <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeftLower]} />
         <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.bottomRight]} />
   
         {/* Form Content */}
         <Text style={styles.mainTitle}>Setup New Password for entreprise</Text>
         <Text style={styles.description}>Please, set up a new password for your account</Text>
    <View style={styles.passwordInputContainer}>
         <TextInput
           style={styles.passwordInput}
           placeholder="New Password"
           secureTextEntry
           placeholderTextColor="#A9A9A9"
           value={password}
           onChangeText={setPassword}
         />
         <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
             <Image
               source={
                 showConfirmPassword
                   ? require('../assets/invisible.png')
                   : require('../assets/view.png')
               }
               style={styles.eyeIcon}
             />
           </TouchableOpacity></View>
            <View style={styles.passwordInputContainer}>
         <TextInput
           style={styles.repeatPasswordInput}
           placeholder="Repeat Password"
           secureTextEntry
           placeholderTextColor="#A9A9A9"
           value={confirmPassword}
           onChangeText={setConfirmPassword}
         /><TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
             <Image
               source={
                 showConfirmPassword
                   ? require('../assets/invisible.png')
                   : require('../assets/view.png')
               }
               style={styles.eyeIcon}
             />
           </TouchableOpacity>
   </View>
         <TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
           <Text style={styles.saveText}>Save</Text>
         </TouchableOpacity>
   
         <TouchableOpacity onPress={() => navigation.goBack()}>
           <Text style={styles.cancelLink}>Cancel</Text>
         </TouchableOpacity>
       </View>
     );
   };
   
   const styles = StyleSheet.create({
   passwordInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    marginLeft: -40,
    marginRight: 10,
    tintColor: '#888',
  },
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 20,
        position: 'relative',
      },
      mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A7C87',
        marginBottom: 12,
        textAlign: 'center',
      },
      description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
        paddingHorizontal: 20,
      },
      passwordInput: {
        width: '100%',
        backgroundColor: '#f8f8f8',
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
      },
      repeatPasswordInput: {
        width: '100%',
        backgroundColor: '#f8f8f8',
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 24,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
      },
      saveButton: {
        width: '100%',
        backgroundColor: '#4A7C87',
        borderRadius: 30,
        paddingVertical: 15,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
      },
      saveText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
      },
      cancelLink: {
        fontSize: 14,
        color: '#4A7C87',
        textDecorationLine: 'underline',
        marginTop: 15,
      },
      decorImage: {
        position: 'absolute',
        width: 450,
        height: 390,
        resizeMode: 'contain',
      },
      topLeft: {
        top: -180,
        left: 50,
      },
      topLeftLower: {
        top: -220,
        left: 80,
      },
      bottomRight: {
        bottom: -80,
        right: -180,
      },
    });

   
export default NewPasswordE;
