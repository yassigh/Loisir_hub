import React from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { TouchableOpacity, Text, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';

const GoogleSignInButton = () => {
  const navigation = useNavigation();
  const { setIsLoggedIn, setToken, setUserType } = React.useContext(AuthContext);

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: '942588876740-0n8m5c8g9endd2t3msocae8lfq81t01o.apps.googleusercontent.com',
      offlineAccess: true
    });
  }, []);

  //v2.0
  const signIn = async () => {
    try {
   await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut(); // Ajouté pour éviter les problèmes de session
    const userInfo = await GoogleSignin.signIn();
    console.log('Google Sign-In userInfo:', userInfo);

   const { user, idToken } = userInfo.data || {};

    if (!user || !idToken) {
      throw new Error('Données utilisateur manquantes');
    }
      const response = await fetch('http://192.168.100.122:8001/api/auth/google/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: idToken,
          email: user.email,
          name: user.name,
          photo: user.photo
        }),
      });
  
      const data = await response.json();
      console.log('Server Response:', data);
  
      if (data.token) {
        await AsyncStorage.setItem('auth_token', data.token);
        await AsyncStorage.setItem('user_type', 'user');
        
        setToken(data.token);
        setUserType('user');
        setIsLoggedIn(true);
  
    navigation.navigate('SelectInterests');
      } else {
        throw new Error('Token non reçu du serveur');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Erreur de connexion',
        'Une erreur est survenue lors de la connexion avec Google.'
      );
    }
  };
  //v1.0
  // const signIn = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     console.log('Complete userInfo:', JSON.stringify(userInfo, null, 2));

  //     // Using correct data structure
  //     const { user, idToken } = userInfo;

  //     const response = await fetch('http://192.168.100.122:8001/api/auth/google/mobile', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         idToken,
  //         email: user.email,
  //         name: user.name,
  //         photo: user.photo
  //       }),
  //     });

  //     const data = await response.json();
  //     console.log('Server Response:', data);

  //     if (data.token) {
  //       await AsyncStorage.setItem('auth_token', data.token);
  //       await AsyncStorage.setItem('user_type', 'user');
        
  //       setToken(data.token);
  //       setUserType('user');
  //       setIsLoggedIn(true);

  //       navigation.navigate('Home', {
  //         screen: 'ChoisiTypeGroup',
  //         params: { screen: 'SelectInterests' },
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Google Sign-In Error:', error);
  //     Alert.alert(
  //       'Erreur de connexion',
  //       'Une erreur est survenue lors de la connexion avec Google.'
  //     );
  //   }
  // };

  return (
    <TouchableOpacity style={styles.button} onPress={signIn}>
      <Image source={require('../assets/google.png')} style={styles.icon} />
      <Text style={styles.text}>Se connecter avec Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  text: {
    color: '#333',
    fontSize: 16,
  },
});

export default GoogleSignInButton;