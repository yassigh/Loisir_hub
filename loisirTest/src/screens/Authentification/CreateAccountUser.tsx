import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PhoneInput from 'react-native-phone-input';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { registerUser } from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ajout d'icônes modernes

type RootStackParamList = {
    Start: undefined;
    choisiType: undefined;
    CreateAccountUser: undefined;
    CreateAccountEntreprise: undefined;
    LoginScreen: undefined;
    
};

const CreateAccountUser: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [numTelU, setNumTelU] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const phoneRef = useRef<PhoneInput>(null);
    
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
    const navigation = useNavigation<NavigationProps>();

    const handleChooseImage = () => {
        launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
            if (response.didCancel) {
                console.log('Sélection d’image annulée');
                return;
            } else if (response.errorMessage) {
                Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l’image.');
                return;
            }

            if (response.assets && response.assets.length > 0) {
                const image = response.assets[0];
                if (image.uri) {
                    setSelectedImage(image.uri);
                }
            }
        });
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !passwordConfirm || !numTelU) {
          Alert.alert('Erreur', 'Tous les champs sont requis.');
          return;
        }
      
        if (password !== passwordConfirm) {
          Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
          return;
        }
      
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('password_confirmation', passwordConfirm);
        formData.append('numTelU', numTelU);
      
        if (selectedImage) {
          formData.append('imageU', {
            uri: selectedImage,
            type: 'image/jpeg',
            name: 'user-profile.jpg',
          });
        }
      
        try {
          const response = await registerUser(formData);
          Alert.alert('Succès', response.message);
          navigation.navigate('LoginScreen');
        } catch (error) {
              console.error('Erreur lors de l\'inscription:', error);
              const errorMessage = (error as { message?: string }).message || 'Une erreur est survenue lors de l\'inscription.';
              Alert.alert('Erreur', errorMessage);
            }
      };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
        <Text style={styles.title}>Create an account</Text>
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

            <TextInput style={styles.input} placeholder="first name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={styles.input} placeholder="Name" value={lastName} onChangeText={setLastName} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <View style={styles.passwordContainer}>
        <TextInput
          style={styles.password}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    {/* Affiche une image œil ouverte/fermée OU une View stylisée */}
    {showPassword ? (
      <Image source={require('../assets/invisible.png')} style={styles.eyeIcon} />
    ) : (
     <Image source={require('../assets/view.png')} style={styles.eyeIcon} />
    )}
    {/* Si tu veux juste une View invisible/visible, remplace par :
    <View style={[
      styles.eyeView,
      { backgroundColor: showPassword ? '#4A7C87' : '#ddd' }
    ]} />
    */}
  </TouchableOpacity>
      </View>
       <View style={styles.passwordContainer}>
        <TextInput
          style={styles.password}
          placeholder="Confirm password"
          secureTextEntry={!showConfirmPassword}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    {/* Affiche une image œil ouverte/fermée OU une View stylisée */}
    {showPassword ? (
      <Image source={require('../assets/invisible.png')} style={styles.eyeIcon} />
    ) : (
      <Image source={require('../assets/view.png')} style={styles.eyeIcon} />
    )}
    {/* Si tu veux juste une View invisible/visible, remplace par :
    <View style={[
      styles.eyeView,
      { backgroundColor: showPassword ? '#4A7C87' : '#ddd' }
    ]} />
    */}
  </TouchableOpacity>
      </View>
            <PhoneInput ref={phoneRef} initialCountry="tn" onChangePhoneNumber={setNumTelU} textProps={{ placeholder: "Phone number", keyboardType: "phone-pad" }} style={styles.phoneInput} />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>S'inscrire</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
    console.log("Navigation vers LoginScreen");
    navigation.navigate("LoginScreen");
}} style={styles.linkContainer}>
  <Text style={styles.linkText}>Already have an account? Log in</Text>
</TouchableOpacity>


            
        </View>
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
        flex: 1,
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
      phoneInput: {
        width: '90%',
        height: 50,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
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

export default CreateAccountUser;
