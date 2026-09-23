import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { registerEntreprise } from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ajout d'icônes modernes




type RootStackParamList = {
  Start: undefined;
  CreateAccountEntreprise: undefined;
  LoginE: undefined;
};

const CreateAccountEntreprise = () => {
  const [nomE, setNomE] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [matriculeE, setMatriculeE] = useState('');
  const [villeE, setVilleE] = useState('');
  const [adresseE, setAdresseE] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lienFacebookE, setLienFacebookE] = useState('');
  const [lienSiteE, setLienSiteE] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleChooseImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('Sélection d’image annulée');
        return;
      } else if (response.errorMessage) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l’image.');
        return;
      }
  
      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setSelectedImage(image.uri || null);
      }
    });
  };
  const handleRegister = async () => {
    if (!nomE || !email || !password || !passwordConfirm || !matriculeE || !villeE || !adresseE) {
      Alert.alert('Erreur', 'Tous les champs sont requis.');
      return;
    }
  
    if (password !== passwordConfirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
  
    const formData = new FormData();
    formData.append('nomE', nomE);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirmation', passwordConfirm);
    formData.append('matriculeE', matriculeE);
    formData.append('villeE', villeE);
    formData.append('adresseE', adresseE);
    formData.append('lien_facebook_E', lienFacebookE || '');
    formData.append('lien_site_E', lienSiteE || '');
    if (selectedImage) {
      formData.append('logoE', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'entreprise-logo.jpg',
      });
    }
  
    try {
      const response = await registerEntreprise(formData);
      Alert.alert('Succès', response.message);
      navigation.navigate('LoginE');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      const errorMessage = (error as { message?: string }).message || 'Une erreur est survenue lors de l\'inscription.';
      Alert.alert('Erreur', errorMessage);
    }
  };
  

return (
 <ScrollView
    contentContainerStyle={[styles.container, { flexGrow: 1 }]}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.header}>
      <Text style={styles.title}>Inscription Entreprise</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
    </View>

    {/* Choix de l'image */}
    <TouchableOpacity onPress={handleChooseImage} style={styles.imageContainer}>
      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.profileImage} />
      ) : (
        <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
      )}
    </TouchableOpacity>

    {/* Formulaire */}
    <TextInput style={styles.input} placeholder="Nom de l'entreprise" value={nomE} onChangeText={setNomE} />
    <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />

    {/* Mot de passe */}
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.password}
        placeholder="Mot de passe"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        {showPassword ? (
          <Image source={require('../assets/invisible.png')} style={styles.eyeIcon} />
        ) : (
          <Image source={require('../assets/view.png')} style={styles.eyeIcon} />
        )}
      </TouchableOpacity>
    </View>

    {/* Confirmation du mot de passe */}
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.password}
        placeholder="Confirmer le mot de passe"
        secureTextEntry={!showConfirmPassword}
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
      />
      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
        {showConfirmPassword ? (
          <Image source={require('../assets/invisible.png')} style={styles.eyeIcon} />
        ) : (
          <Image source={require('../assets/view.png')} style={styles.eyeIcon} />
        )}
      </TouchableOpacity>
    </View>

    {/* Autres champs */}
    <TextInput style={styles.input} placeholder="Matricule" value={matriculeE} onChangeText={setMatriculeE} />
    <TextInput style={styles.input} placeholder="Ville" value={villeE} onChangeText={setVilleE} />
    <TextInput style={styles.input} placeholder="Adresse" value={adresseE} onChangeText={setAdresseE} />
    <TextInput style={styles.input} placeholder="Lien Facebook" value={lienFacebookE} onChangeText={setLienFacebookE} />
    <TextInput style={styles.input} placeholder="Lien Site Web" value={lienSiteE} onChangeText={setLienSiteE} />

    {/* Bouton pour soumettre */}
    <TouchableOpacity style={styles.button} onPress={handleRegister}>
      <Text style={styles.buttonText}>Créer un compte</Text>
    </TouchableOpacity>

    {/* Lien vers la page de connexion */}
    <TouchableOpacity onPress={() => navigation.navigate('LoginE')} style={styles.linkContainer}>
      <Text style={styles.linkText}>Déjà un compte? Se connecter</Text>
    </TouchableOpacity>
  </ScrollView>
);
};

const styles = StyleSheet.create({
    eyeIcon: {
  width: 22,
  height: 22,
  marginLeft: 10,
},
eyeView: {
  width: 22,
  height: 22,
  borderRadius: 11,
  marginLeft: 10,
},
  container: {
   
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginRight: 10,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraIcon: {
    width: 40,
    height: 40,
    tintColor: '#666',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
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
    width: '90%',
    height: 50,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  password: {
    flex: 1,
    height: '100%',
  },
  button: {
    backgroundColor: '#4A7C87',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: '#4A7C87',
    textDecorationLine: 'underline',
  },

});

export default CreateAccountEntreprise;
