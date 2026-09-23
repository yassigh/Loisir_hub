import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getEvent } from '../services/EventService';
import { getFavores, createFavore,suppFavore } from '../services/FavoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import CommentSection from './CommentSection';
import { getEntityImageUrl } from '../services/imageService';
import { Dimensions } from 'react-native';
import { getEntityImageUrlq } from '../services/imageService';
import { getAllEntreprises } from '../services/authService'; // Importez le service pour récupérer les entreprises


type RootStackParamList = {
  EventList: undefined;
  EventDetail: { eventId: number };
};

type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

interface Event {
  id: number;
  nomEvent: string;
  descriptionEvent: string;
  lieuEvent: string;
  regionEvent: string;
  typeEvent: string;
  date_debutEvent: string;
  date_finEvent: string;
  images?: Array<{ url: string }>;
  categorie: {
    nomCat: string;
  };
  entreprise: {
    nomE: string;
    logoE: string | null;
  };
}

const EventDetailScreen = () => {
  const route = useRoute<EventDetailRouteProp>();
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favored, setFavored] = useState(false);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
    const [entreprises, setEntreprises] = useState<{ [key: number]: { nomE: string; logoE: string | null } }>({});
    
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
  
        // Récupérez les détails de l'événement
        const eventData = await getEvent(eventId);
  
        // Ajoutez les informations de l'entreprise si elles ne sont pas incluses
        if (!eventData.entreprise) {
          const entreprisesData = await getAllEntreprises();
          const entreprise = entreprisesData.find(
            (e: { id: number }) => e.id === parseInt(eventData.entreprise_id)
          );
          eventData.entreprise = entreprise || { nomE: 'Entreprise inconnue', logoE: null };
        }
  
        setEvent(eventData);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'événement:', error);
        setError('Impossible de charger les détails de l\'événement');
      } finally {
        setLoading(false);
      }
    };


    const fetchFavores = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User ID not found');
        }
        const favoresData = await getFavores(userId);
        const isFavored = favoresData.some((favore: any) => favore.entity_id === eventId && favore.entity_type === 'evenements');
        setFavored(isFavored);
      } catch (error) {
        console.error('Erreur lors de la récupération des favores:', error);
      }
    };

    fetchEventDetails();
    fetchFavores();
  }, [eventId]);

  const handleFavorePress = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) throw new Error('User ID not found');

    const favoresData = await getFavores(userId);
    const favore = favoresData.find(
      (favore: any) =>
        Number(favore.entity_id) === eventId && favore.entity_type === 'evenements'
    );

    if (favored && favore) {
      // Déjà favori, donc on supprime
      await suppFavore(favore.id);
      setFavored(false);
      Alert.alert('Succès', 'Événement supprimé des favoris');
    } else if (!favored) {
      // Pas encore favori, donc on ajoute
      const favoreData = {
        user_id: userId,
        entity_id: eventId,
        entity_type: 'evenements',
        event_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      await createFavore(favoreData);
      setFavored(true);
      Alert.alert('Succès', 'Événement ajouté aux favoris');
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    Alert.alert('Erreur', 'Impossible de gérer les favoris');
  }
};
  const toggleComments = (eventId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Événement non trouvé'}</Text>
      </View>
    );
  }
  const debugImageUrl = (url: string | null) => {
    console.log('Raw image URL:', url);
    const processedUrl = getEntityImageUrl(url, 'events');
    console.log('Processed image URL:', processedUrl);
    return processedUrl;
  };


  return (
    <ScrollView style={styles.container}>
   <View style={styles.imageContainer}>
  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    onScroll={(event) => {
      const slide = Math.round(
        event.nativeEvent.contentOffset.x / screenWidth
      );
      setCurrentImageIndex(slide);
    }}
    scrollEventThrottle={16}
  >
    {event.images && event.images.length > 0 ? (
      event.images.map((image, index) => (
        <View key={index} style={[styles.imageSlide, { width: screenWidth }]}>
          <Image
            source={{
              uri: debugImageUrl(image.url),
              headers: { Accept: '*/*' }
            }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        </View>
      ))
    ) : (
      <View style={[styles.imageSlide, { width: screenWidth }]}>
        <Image
          source={require('../assets/placeholder.png')}
          style={styles.eventImage}
          resizeMode="cover"
        />
      </View>
    )}
  </ScrollView>

  {/* Image Indicators */}
  {event.images && event.images.length > 1 && (
    <View style={styles.pagination}>
      {event.images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentImageIndex && styles.paginationDotActive
          ]}
        />
      ))}
    </View>
  )}

  {/* Favorite Button */}
  <TouchableOpacity
    style={styles.favoreIconContainer}
    onPress={handleFavorePress}
  >
    <Image
      source={require('../assets/favores.png')}
      style={[styles.favoreIcon, favored && styles.favoreIconActive]}
    />
  </TouchableOpacity>
</View>

      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={() => toggleComments(event.id)} style={styles.commentIconContainer}>
          <Image source={require('../assets/chat.png')} style={styles.commentIcon} />
        </TouchableOpacity>
        {expandedComments[event.id] && (
          <CommentSection elementId={event.id} elementType="evenements" />
        )}
        {/* Logo et nom de l'entreprise */}
        <View style={styles.companyContainer}>
  {event.entreprise && event.entreprise.logoE ? (
    <Image
      source={{ uri: `http://192.168.100.122:8001/storage/${event.entreprise.logoE}` }}
      style={styles.companyLogo}
    />
  ) : (
    <Image source={require('../assets/placeholder.png')} style={styles.companyLogo} />
  )}
  <Text style={styles.companyName}>
    {event.entreprise ? event.entreprise.nomE : 'Entreprise inconnue'}
  </Text>
</View>
        <Text style={styles.title}>{event.nomEvent}</Text>

        <View style={styles.dateContainer}>
          <Text style={styles.dateTitle}>Dates</Text>
          <Text style={styles.date}>Du {new Date(event.date_debutEvent).toLocaleDateString()}</Text>
          <Text style={styles.date}>Au {new Date(event.date_finEvent).toLocaleDateString()}</Text>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Localisation</Text>
          <Text style={styles.location}>{event.regionEvent}</Text>
          <Text style={styles.address}>{event.lieuEvent}</Text>
        </View>

        <View style={styles.typeContainer}>
          <Text style={styles.typeTitle}>Type d'événement</Text>
          <Text style={styles.type}>{event.typeEvent}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{event.descriptionEvent}</Text>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Catégorie</Text>
          <Text style={styles.category}>{event.categorie.nomCat}</Text>
        </View>

      
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  companyLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Fond noir
  }, commentIconContainer: {

    marginTop: 8,
  },
  participateButton: {
    backgroundColor: '#4A7C87', // Bleu-vert foncé
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  participateButtonText: {
    color: '#FFFFFF', // Blanc
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentIcon: {
    width: 24,
    height: 24,

  },
  commentsContainer: {
    marginTop: 20,
  },
  favoreIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoreIcon: {
    width: 24,
    height: 24,
    tintColor: '#8EB6AD', // Default color
  },
  favoreIconActive: {
    tintColor: 'red', // Active color
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8', // Fond noir
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  activityImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#F8F8F8', // Fond noir
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D7A738', // Jaune doré
    marginBottom: 16,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738', // Jaune doré
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#8EB6AD', // Bleu-vert clair
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C87', // Bleu-vert foncé
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#D32F2F', // Rouge pour l'offre
    marginLeft: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738', // Jaune doré
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#00000', // Blanc
  },
  address: {
    fontSize: 14,
    color: '#8EB6AD', // Bleu-vert clair
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738', // Jaune doré
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#00000', // Blanc
    lineHeight: 24,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738', // Jaune doré
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#8EB6AD', // Bleu-vert clair
  },
  typeContainer: {
    marginBottom: 16,
  },
  type: {
    fontSize: 16,
    color: '#8EB6AD', // Bleu-vert clair
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738', // Jaune doré
    marginBottom: 8,
  },
  reserveButton: {
    backgroundColor: '#4A7C87', // Bleu-vert foncé
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#FFFFFF', // Blanc
    fontSize: 18,
    fontWeight: 'bold',
  },

  imageSlide: {
    height: 300,
  },
  
  pagination: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
export default EventDetailScreen;