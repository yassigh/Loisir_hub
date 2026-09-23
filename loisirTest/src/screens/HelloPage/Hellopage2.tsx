import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importation de useNavigation pour la navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  profileEntrep: undefined;
  Acceuil: undefined;
  CreateAccountUser: undefined;
  CreateAccountEntreprise: undefined;
  LoginScreen: undefined;
  HelloPage1: undefined;
};
const HelloCard = () => {
  const [currentPage, setCurrentPage] = useState(1);
 
  type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
    const navigation = useNavigation<NavigationProps>();

  // Contenu des pages : chaque page a un titre, une description, et une image associée
  const pages = [
    {
      title: "Hello",
      description: "Create your account and dive into a world rich in leisure activities to discover. With LoisirHub, you have access to an all-in-one platform that allows you to book, manage and explore the best leisure options in Tunisia.",
      image: require('../assets/flamenco-dancer.jpg'),
    },
    {
      title: "Hello",
      description: " In just a few clicks, you can search for activities, book your outings, and discover events, restaurants, hotels and more. Whether it's for a sports, cultural or gastronomic getaway, LoisirHub offers you a personalized experience, adapted to your desires.",
      image: require('../assets/A.png'), // Remplacez par l'image de la deuxième page
    },
    {
      title: "Hello",
      description: "LoisirHub guarantees a smooth and secure experience. With integrated payment options, you can book your activities without worry and fully enjoy your moments of relaxation. At any time, you can manage your reservations and personalized notifications directly from your profile.",
      image: require('../assets/happy-male-tourist-leaning-railing-listening-music.jpg'), // Remplacez par l'image de la troisième page
    },
  ];

  // Gérer le changement de page
  const handlePageChange = () => {
    if (currentPage <= pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Gérer la navigation vers la page de connexion lorsque nous arrivons à la dernière page
  const handleFinalPage = () => {
    if (currentPage === pages.length) {
      navigation.navigate('profileEntrep'); // Redirige vers l'écran de connexion
    } else {
      handlePageChange();
    }
  };

  return (
    <View style={styles.helloCard}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.statusIcons}>
            <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.topLeftLower]} />
            <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
          </View>
        </View>
        
        {/* Image et texte dynamiques en fonction de la page active */}
        <Image
          source={pages[currentPage - 1].image} // Image de la page active
          style={styles.mainImage}
        />
        <Text style={styles.headline}>{pages[currentPage - 1].title}</Text>
        <Text style={styles.description}>
          {pages[currentPage - 1].description}
        </Text>
      </View>

      {/* Pagination */}
      <View style={styles.pagination}>
        {[...Array(pages.length)].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.pageDot, currentPage === index + 1 && styles.activeDot]}
            onPress={() => setCurrentPage(index + 1)} // Changer la page lorsque le point est cliqué
          />
        ))}
      </View>

      {/* Bouton pour passer à la page suivante ou aller à la page Login */}
      <TouchableOpacity style={styles.nextButton} onPress={handleFinalPage}>
        <Image source={require('../assets/right.png')} style={styles.nextButtonImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  helloCard: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    width: '100%',
    paddingBottom: 27,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  statusIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorImage: {
    position: 'absolute',
    width: 390,
    height: 290,
  },
  topLeft: {
    top: -120,
    left: 110,
  },
  topLeftLower: {
    top: -100,
    left: 100,
  },
  cardContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '130%',
  },
  mainImage: {
    aspectRatio: 0.96,
    resizeMode: 'cover',
    height: '40%',
    width: '100%',
    alignSelf: 'center',
    marginTop: 0,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headline: {
    color: '#202020',
    letterSpacing: -0.28,
    textAlign: 'center',
    marginTop: 30,
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'Raleway, sans-serif',
  },
  description: {
    color: '#555',
    textAlign: 'center',
    width: '80%',
    marginTop: 5,
    fontWeight: '300',
    fontSize: 15,
    lineHeight: 27,
    fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageDot: {
    width: 12,
    height: 12,
    margin: 5,
    borderRadius: 6,
    backgroundColor: '#E0E0E0', // Gris clair pour les points inactifs
  },
  activeDot: {
    backgroundColor: '#D7A738', // Couleur plus forte pour le point actif
    width: 18, // Agrandissement du point actif
    height: 18,
  },
  nextButton: {
    marginTop: -30,
    width: 30,
    height: 30,
    backgroundColor: '#D7A738',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  nextButtonImage: {
    width: 35,
    height: 35,
    tintColor: '#fff',
  },
});

export default HelloCard;
