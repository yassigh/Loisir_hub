import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCentresInteret, saveUserInterests } from '../services/interestService';
import { getEntityImageUrla } from '../services/imageService';
import { NavigationProp } from '@react-navigation/native';
import axios from 'axios'; // Ajoutez axios pour les requêtes API
import { useFocusEffect } from '@react-navigation/native';

type LoginEProps = {
  navigation: NavigationProp<any>;
};
interface CentreInteret {
  id: number;
  nom: string;
  description: string;
  image: string | null;
}

const SelectInterests: React.FC<LoginEProps> = ({ navigation }) => {
  const [centres, setCentres] = useState<CentreInteret[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [clickCount, setClickCount] = useState(0); // Compteur de clics
interface RouteParams {
  successMessage?: string;
}

const route = useRoute();
const params = (route as any).params || {};
const [success, setSuccess] = useState(params.successMessage || '');
  useEffect(() => {
     if (success) {
    const timer = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(timer);
  }
    const fetchCentres = async () => {
      try {
        const data = await getCentresInteret();
        console.log('Centres d\'intérêt récupérés :', data);
        setCentres(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des centres d\'intérêt:', error);
        Alert.alert('Erreur', 'Impossible de récupérer les centres d\'intérêt.');
      }
    };

    const fetchUserSelectedInterests = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const token = await AsyncStorage.getItem('auth_token'); // Assurez-vous que le token est récupéré
        console.log('User ID:', userId);
        console.log('Token:', token);
    
        if (!userId || !token) {
          throw new Error('User ID ou token non trouvé');
        }
    
        const response = await axios.get(`http://192.168.100.122:8001/api/user/centres-interet`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ajoutez le token dans l'en-tête
          },
        });
    
        const userInterests = response.data.map((interest: { id: number }) => interest.id);
        console.log('Centres d\'intérêt sélectionnés par l\'utilisateur :', userInterests);
        setSelectedInterests(userInterests);
        setClickCount(userInterests.length);
      } catch (error) {
        console.error('Erreur lors de la récupération des centres d\'intérêt sélectionnés :', error);
        Alert.alert('Erreur', 'Impossible de récupérer vos centres d\'intérêt sélectionnés.');
      }
    };
    fetchCentres();
    fetchUserSelectedInterests();
  }, [success]);
useFocusEffect(
  React.useCallback(() => {
    if (params?.successMessage) {
      setSuccess(params.successMessage);
    }
  }, [params?.successMessage])
);
  const toggleInterest = (id: number) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((interestId) => interestId !== id));
      setClickCount(clickCount - 1); // Décrémentez le compteur
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, id]);
      setClickCount(clickCount + 1); // Incrémentez le compteur
    } else {
      Alert.alert('Limite atteinte', 'Vous pouvez sélectionner un maximum de 5 centres d\'intérêt.');
    }
  };

  const handleSubmit = async () => {
    if (selectedInterests.length < 3) {
      Alert.alert('Sélection insuffisante', 'Veuillez sélectionner au moins 3 centres d\'intérêt.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID non trouvé');
      }

      await saveUserInterests(userId, selectedInterests);
      Alert.alert('Succès', 'Vos centres d\'intérêt ont été enregistrés.');
      navigation.navigate('HelloPage1'); // Redirige vers la page d'accueil ou une autre page
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des centres d\'intérêt:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {success ? (
  <View style={styles.successContainer}>
    <Image source={require('../assets/iconn.png')} style={styles.successIcon} />
    <Text style={styles.successText}>{success}</Text>
  </View>
) : null}
      <Text style={styles.title}>Sélectionnez vos centres d'intérêt</Text>
      <Text style={styles.subtitle}>Choisissez entre 3 et 5 centres d'intérêt</Text>

      {/* Affichage du compteur */}
      <Text style={styles.counter}>Centres sélectionnés : {clickCount}</Text>

      <View style={styles.grid}>
  {centres.map((centre) => {
   const imageUrl =
  centre.image && centre.image.startsWith('http')
    ? centre.image
    : centre.image
    ? `http://192.168.100.122:8001/storage/${centre.image.replace(/\\/g, '/')}`
    : null;
    return (
      <TouchableOpacity
        key={centre.id}
        style={[
          styles.card,
          selectedInterests.includes(centre.id) && styles.cardSelected,
        ]}
        onPress={() => toggleInterest(centre.id)}
      >
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require('../assets/placeholder.png')
          }
          style={styles.cardImage}
        />
        <Text style={styles.cardTitle}>{centre.nom}</Text>
        <Text style={styles.cardDescription}>{centre.description}</Text>
      </TouchableOpacity>
    );
  })}
</View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Terminer</Text>
      </TouchableOpacity>
      <View style={{height:50}}></View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
   successContainer: {
  backgroundColor: '#d4edda',
  borderRadius: 8,
  padding: 12,
  marginVertical: 12,
  borderWidth: 1,
  borderColor: '#c3e6cb',
  flexDirection: 'row',
  alignItems: 'center',
},
successText: {
  color: '#155724',
  fontWeight: 'bold',
  fontSize: 15,
  flex: 1,
  marginLeft: 8,
},
successIcon: {
  width: 24,
  height: 24,
  marginRight: 8,
},
  container: {
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  counter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permet d'afficher plusieurs lignes
    justifyContent: 'space-between', // Espace entre les cartes
    paddingHorizontal: -8, // Compense le padding horizontal des cartes
  },
  card: {
    width: '48%', // Deux cartes par ligne
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
   
  },
  cardSelected: {
    borderColor: '#D7A738',
    borderWidth: 2,
    shadowColor: '#D7A738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4A7C87',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SelectInterests;