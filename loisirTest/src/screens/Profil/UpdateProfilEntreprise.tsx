import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import ProfileService from '../services/ProfileService';
import detailService from '../services/detailService';
import { StackNavigationProp } from '@react-navigation/stack';
import { authApi } from '../services/Api';

type RootStackParamList = {
  Start: undefined;
  choisiType: undefined;
  CreateAccountUser: undefined;
  CreateAccountEntreprise: undefined;
  LoginScreen: undefined;
};

type UpdateProfilEntrepriseNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: UpdateProfilEntrepriseNavigationProp;
}

export default function UpdateProfilEntreprise({ navigation }: Props) {
  const [entreprise, setEntreprise] = useState<{
    nomE: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    matriculeE: string;
    villeE: string;
    adresseE: string;
    lien_facebook_E: string;
    lien_site_E: string;
    logoE: string | null;
  }>({
    nomE: '',
    email: '',
    password: '',
    password_confirmation: '',
    matriculeE: '',
    villeE: '',
    adresseE: '',
    lien_facebook_E: '',
    lien_site_E: '',
    logoE: null,
  });

  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntrepriseDetails = async () => {
      try {
        const response = await detailService.getEntrepriseDetails();
        setEntreprise(response);
        setSelectedLogo(response.logoE ? `http://192.168.100.122:8001/storage/${response.logoE}` : null);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'entreprise:", error);
      }
    };

    fetchEntrepriseDetails();
  }, []);

  const handleChooseLogo = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setSelectedLogo(image.uri ?? null);
      }
    });
  };

  const handleUpdate = async () => {
    if (entreprise.password) {
      if (entreprise.password !== entreprise.password_confirmation) {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
        return;
      }
    }
  
    const formData = new FormData();
    formData.append('nomE', entreprise.nomE);
    formData.append('email', entreprise.email);
    formData.append('matriculeE', entreprise.matriculeE);
    formData.append('villeE', entreprise.villeE);
    formData.append('adresseE', entreprise.adresseE);
    formData.append('lien_facebook_E', entreprise.lien_facebook_E);
    formData.append('lien_site_E', entreprise.lien_site_E);
  
    if (entreprise.password) {
      formData.append('password', entreprise.password);
      formData.append('password_confirmation', entreprise.password_confirmation);
    }
  
    if (selectedLogo && selectedLogo !== entreprise.logoE) {
      formData.append('logoE', {
        uri: selectedLogo,
        type: 'image/jpeg',
        name: 'logo.jpg',
      });
    }
  
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé.');
        return;
      }
  
      const response = await authApi.post('/entreprise/update', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', "Échec de la mise à jour du profil");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le Profil</Text>
      <TouchableOpacity onPress={handleChooseLogo} style={styles.imageContainer}>
        {selectedLogo ? (
          <Image source={{ uri: selectedLogo }} style={styles.profileImage} />
        ) : (
          <Text>Choisir un logo</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={entreprise.nomE}
        onChangeText={(text) => setEntreprise({ ...entreprise, nomE: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={entreprise.email}
        onChangeText={(text) => setEntreprise({ ...entreprise, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe (laisser vide si inchangé)"
        secureTextEntry
        value={entreprise.password}
        onChangeText={(text) => setEntreprise({ ...entreprise, password: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        secureTextEntry
        value={entreprise.password_confirmation}
        onChangeText={(text) => setEntreprise({ ...entreprise, password_confirmation: text })}
      />
      <TextInput
        style={[styles.input, styles.disabledInput]}
        placeholder="Matricule"
        value={entreprise.matriculeE}
        editable={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Ville"
        value={entreprise.villeE}
        onChangeText={(text) => setEntreprise({ ...entreprise, villeE: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Adresse"
        value={entreprise.adresseE}
        onChangeText={(text) => setEntreprise({ ...entreprise, adresseE: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Lien Facebook"
        value={entreprise.lien_facebook_E}
        onChangeText={(text) => setEntreprise({ ...entreprise, lien_facebook_E: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Lien Site Web"
        value={entreprise.lien_site_E}
        onChangeText={(text) => setEntreprise({ ...entreprise, lien_site_E: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
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
  disabledInput: {
    backgroundColor: '#eaeaea',
    color: '#aaa',
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