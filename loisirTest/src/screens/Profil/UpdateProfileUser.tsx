import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, Alert } from 'react-native';
import PhoneInput from 'react-native-phone-input';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateUser, getUserDetails } from '../services/authService';
import { authApi } from '../services/Api';
import { getFullImageUrl } from '../services/imageService'; // Importez la fonction pour générer l'URL complète

type RootStackParamList = {
  Start: undefined;
  choisiType: undefined;
  CreateAccountUser: undefined;
  CreateAccountEntreprise: undefined;
  LoginScreen: undefined;
  profileUser: undefined;
};

const UpdateProfileUser: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [numTelU, setNumTelU] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const phoneRef = useRef<PhoneInput>(null);

  type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProps>();

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const userDetails: { id: any; email: any; first_name: any; last_name: any; numTelU?: string; imageU?: string } = await getUserDetails(token);
        if (userDetails) {
          setFirstName(userDetails.first_name);
          setLastName(userDetails.last_name);
          setEmail(userDetails.email);
          setNumTelU(userDetails.numTelU || '');
          setSelectedImage(userDetails.imageU ? getFullImageUrl(userDetails.imageU) : null); // Utilisez l'URL complète
          if (phoneRef.current) {
            phoneRef.current.setValue(userDetails.numTelU || '');
          }
        } else {
          Alert.alert('Erreur', 'Aucun détail utilisateur trouvé.');
        }
      } else {
        Alert.alert('Erreur', 'Aucun token trouvé.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération des données utilisateur.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChooseImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setSelectedImage(image.uri ?? null);
      }
    });
  };
  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('numTelU', numTelU);
  
    if (password) {
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirm);
    }
  
    if (selectedImage) {
      formData.append('imageU', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }
  
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé.');
        return;
      }
  
      const response = await authApi.post('/user/update', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      Alert.alert('Succès', 'Profil mis à jour avec succès.');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du profil.');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Mettre à jour le profil</Text>
        <TouchableOpacity onPress={handleChooseImage} style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.profileImage} />
          ) : (
            <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
          )}
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Nom" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Mot de passe (optionnel)" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirmer Mot de passe (optionnel)" secureTextEntry value={passwordConfirm} onChangeText={setPasswordConfirm} />
      <PhoneInput ref={phoneRef} initialCountry="tn" textProps={{ placeholder: "Numéro de téléphone", keyboardType: "phone-pad" }} style={styles.phoneInput} />

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Chargement...' : 'Mettre à jour'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIcon: {
    width: 40,
    height: 40,
    tintColor: '#666',
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
  phoneInput: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical:14,
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
  button: {
    backgroundColor: '#4A7C87',
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateProfileUser;