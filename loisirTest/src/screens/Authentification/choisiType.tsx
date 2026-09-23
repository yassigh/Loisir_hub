import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Start: undefined;
  choisiType: undefined;
  CreateAccountUser: undefined;
  CreateAccountEntreprise: undefined;
  LoginScreen: undefined;  // Vérifier que cet écran est bien dans le stack de navigation
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const MyComponent = () => {
  const navigation = useNavigation<NavigationProps>();

  return (
    <View style={styles.profileChoiceContainer}>
      {/* Image de fond */}
      <Image source={require('../assets/background2.png')} style={[styles.decorImage, styles.bottomRight]} />

      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Titre */}
      <Text style={styles.title}>Choisissez le profil</Text>

      {/* Section avec deux images cliquables */}
      <View style={styles.recentlyViewedContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAccountUser')} style={styles.profileCard}>
          <Image source={require('../assets/utilisateur.png')} style={styles.profileImage} />
          <Text style={styles.profileText}>User</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CreateAccountEntreprise')} style={styles.profileCard}>
          <Image source={require('../assets/entreprise.png')} style={styles.profileImage} />
          <Text style={styles.profileText}>Entreprise</Text>
        </TouchableOpacity>
      </View>

      {/* Image de fond supplémentaire */}
      <Image source={require('../assets/background2.png')} style={[styles.decorImage, styles.topLeftLower]} />
    </View>
  );
};

const styles = StyleSheet.create({
  decorImage: {
    position: 'absolute',
    width: 500,
    height: 390,
    opacity: 0.3, // Réduire l'opacité pour que l'image de fond soit plus subtile
  },
  bottomRight: {
    bottom: -40,
    right: 40,
  },
  topLeftLower: {
    top: -100,
    left: -120,
  },
  logo: {
    width:165, height:55,
    marginBottom: 30,
  },
  profileChoiceContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingTop: 80,
    paddingBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 20, // Ajout d'un rayon de bord pour un look plus doux
    paddingHorizontal: 20, // Ajouter un peu de marge sur les côtés
  },
  title: {
    fontSize: 36,
    color: '#4A7C87',
    fontWeight: '700',
    fontFamily: 'Raleway',
    textAlign: 'center',
    marginVertical: 20, // Ajouter un espace pour l'aérer
    letterSpacing: 1, // Espacer légèrement les lettres pour un effet plus moderne
  },
  recentlyViewedContainer: {
    marginTop: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20, // Ajouter un peu d'espace sous les images
  },
  profileCard: {
    width: 180,
    height: 220,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4, // Ajouter une bordure fine pour les images
    borderColor: '#8EB6AD', // Une bordure douce pour bien encadrer les images
    marginBottom: 10,
  },
  profileText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4A7C87',
    textAlign: 'center',
  },
});

export default MyComponent;
