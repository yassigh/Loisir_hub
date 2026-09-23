import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getActivityById, getAllActivities } from '../services/activityService';
import { useRoute, RouteProp } from '@react-navigation/native';
import CommentSection from './CommentSection';
import { getFavores, createFavore, suppFavore } from '../services/FavoreService'; // Import the getFavores and createFavore services
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntityImageUrl } from '../services/imageService';
import HotelReservationForm from '../Reservation/HotelReservationForm';
import ActivityReservationForm from '../Reservation/ActivityReservationForm';
import CafeRestoReservationForm from '../Reservation/CafeRestoReservationForm';
import { Dimensions } from 'react-native';
import CulturelleForm from '../Reservation/CulturelleForm';
import { getEntityImageUrlq } from '../services/imageService';
import Post from '../Post/Post';
import { getAllEntreprises } from '../services/authService';
import ReservationForm from '../Reservation/ReservationForm';

type RootStackParamList = {
  ActivityList: undefined;
  ActivityDetail: { activityId: number };
};

type ActivityDetailRouteProp = RouteProp<RootStackParamList, 'ActivityDetail'>;
interface Activity {
  idActP: number;
  nomActP: string;
  prixP: number;
  offreP?: string;
  descriptionP: string;
  regionP: string;
  lieuP: string;
  jours?: number | null; // Ajout de l'attribut jours
  heure?: number | null; // Ajout de l'attribut heures
  minute?: number | null;
  images?: Array<{ url: string }>;
  categorie: {
    nomCat: string;
  };
  entreprise: {
    id: number;
    nomE: string;
    logoE: string | null;
  };

}
interface Favore {
  id: string | number;
  entity_id: string | number;
  entity_type: string;
  event_date: string;
  title?: string;
  image?: string;
  user_name?: string;
  user_id: string | number;
}
const ActivityDetailScreen = () => {
  const route = useRoute<ActivityDetailRouteProp>();
  const { activityId } = route.params;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [favoredActivities, setFavoredActivities] = useState<{ [key: number]: boolean }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        setLoading(true);

        // Récupérez les détails de l'activité
        const activityData = await getActivityById(activityId);

        // Ajoutez les informations de l'entreprise si elles ne sont pas incluses
        if (!activityData.entreprise) {
          const entreprisesData = await getAllEntreprises();
          const entreprise = entreprisesData.find(
            (e: { id: number }) => e.id === parseInt(activityData.entreprise_id)
          );
          activityData.entreprise = entreprise || { nomE: 'Entreprise inconnue', logoE: null };
        }

        setActivity(activityData);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'activité:', error);
        setError('Impossible de charger les détails de l\'activité');
      } finally {
        setLoading(false);
      }
    };
    const fetchFavores = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        setUserId(userId);
        if (!userId) {
          throw new Error('User ID not found');
        }
        const favoresData: Favore[] = await getFavores(userId);
        const favoredActivitiesMap: { [key: number]: boolean } = {};
        favoresData.forEach((favore) => {
          if (favore.entity_type === 'activite_payants') {
            favoredActivitiesMap[favore.entity_id as number] = true;
          }
        });
        setFavoredActivities(favoredActivitiesMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des favores:', error);
      }
    };
    fetchFavores();
    fetchActivityDetails();
  }, [activityId]);

  const toggleComments = (activityId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const handleFavorePress = async (entityId: number, entityType: string, setFavored: (v: boolean) => void, favored: boolean) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) throw new Error('User ID not found');

    const favoresData = await getFavores(userId);
    const favore = favoresData.find(
      (favore: any) =>
        Number(favore.entity_id) === entityId && favore.entity_type === entityType
    );

    if (favored && favore) {
      // Déjà favori, donc on supprime
      await suppFavore(favore.id);
      setFavored(false);
      Alert.alert('Succès', 'Supprimé des favoris');
    } else if (!favored) {
      // Pas encore favori, donc on ajoute
      const favoreData = {
        user_id: userId,
        entity_id: entityId,
        entity_type: entityType,
        event_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      await createFavore(favoreData);
      setFavored(true);
      Alert.alert('Succès', 'Ajouté aux favoris');
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    Alert.alert('Erreur', 'Impossible de gérer les favoris');
  }
};

  const handleReservationSuccess = () => {
    Alert.alert('Success', 'Réservation réussie');
    setShowReservationForm(false); // Hide the form after successful reservation
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  if (error || !activity) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Activité non trouvée'}</Text>
      </View>
    );
  }

  const debugImageUrl = (url: string | null) => {
    console.log('Raw image URL:', url);
    const processedUrl = getEntityImageUrl(url, 'activities');
    console.log('Processed image URL:', processedUrl);
    return processedUrl;
  };
  // Add this function before the component
  const extractPrice = (priceString: string | number): number => {
    if (typeof priceString === 'number') return priceString;

    // Cherche une séquence de chiffres avec possibilité d'un point ou virgule decimal
    const match = priceString.match(/^\d+([.,]\d+)?/);
    if (match) {
      // Remplace la virgule par un point et convertit en nombre
      return parseFloat(match[0].replace(',', '.'));
    }
    return 0;
  };

  // Modifiez la fonction calculateDiscountedPrice
  const calculateDiscountedPrice = (originalPrice: string | number, discount: string): string => {
    // Extraire le prix numérique
    const price = extractPrice(originalPrice);

    // Convertir la chaîne de remise en nombre
    const discountPercent = Number(discount?.replace(/[^0-9.]/g, '') || 0);

    // Vérifier si les valeurs sont valides
    if (isNaN(price) || isNaN(discountPercent)) {
      console.log('Invalid price or discount:', { price, discountPercent });
      return price.toString();
    }

    // Calculer le prix réduit
    const discountAmount = (price * discountPercent) / 100;
    const finalPrice = price - discountAmount;

    return finalPrice.toFixed(2);
  };

  // Ajoutez cette fonction utilitaire pour formater la durée
  const formatDuration = (priceString: string | number): { price: string, duration: string } => {
    const fullString = String(priceString);

    // Séparer le prix et la durée (le prix est avant "DT", la durée après)
    const [priceStr, ...durationParts] = fullString.split('TND');
    const durationStr = durationParts.join('TND').trim();

    // Extraire le prix
    const price = parseFloat(priceStr.replace(',', '.')) || 0;

    // Extraire les différentes parties de la durée
    const jMatch = durationStr.match(/(\d+)\s*j\b/);
    const hMatch = durationStr.match(/(\d+)\s*h\b/);
    const minMatch = durationStr.match(/(\d+)\s*min\b/);

    // Construire la durée uniquement avec les valeurs non nulles
    const formattedDurationParts = [];

    if (jMatch && parseInt(jMatch[1]) > 0) {
      durationParts.push(`${jMatch[1]} jour${jMatch[1] === '1' ? '' : 's'}`);
    }
    if (hMatch && parseInt(hMatch[1]) > 0) {
      durationParts.push(`${hMatch[1]} heure${hMatch[1] === '1' ? '' : 's'}`);
    }
    if (minMatch && parseInt(minMatch[1]) > 0) {
      durationParts.push(`${minMatch[1]} minute${minMatch[1] === '1' ? '' : 's'}`);
    }

    return {
      price: price.toFixed(2),
      duration: durationParts.join(' ')
    };
  };
  const formatDurationText = (jours?: number | null, heure?: number | null, minute?: number | null): string => {
    const parts = [];
    
    if (jours && jours > 0) {
      parts.push(`${jours} jour${jours > 1 ? 's' : ''}`);
    }
    if (heure && heure > 0) {
      parts.push(`${heure} heure${heure > 1 ? 's' : ''}`);
    }
    if (minute && minute > 0) {
      parts.push(`${minute} minute${minute > 1 ? 's' : ''}`);
    }
    
    return parts.length > 0 ? `Pendant ${parts.join(', ')}` : '';
  };
  console.log('Logo URL:', `http://192.168.100.122:8001/storage/${activity.entreprise.logoE}`);
  return (
    <ScrollView style={styles.container}>
     // Replace the existing imageContainer section in the return statement
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
          {activity.images && activity.images.length > 0 ? (
            activity.images.map((image, index) => (
              <View key={index} style={[styles.imageSlide, { width: screenWidth }]}>
                <Image
                  source={{
                    uri: debugImageUrl(image.url),
                    headers: { Accept: '*/*' }
                  }}
                  style={styles.activityImage}
                  resizeMode="cover"
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
              </View>
            ))
          ) : (
            <View style={[styles.imageSlide, { width: screenWidth }]}>
              <Image
                source={require('../assets/placeholder.png')}
                style={styles.activityImage}
                resizeMode="cover"
              />
            </View>
          )}
        </ScrollView>

        {/* Image Indicators */}
        {activity.images && activity.images.length > 1 && (
          <View style={styles.pagination}>
            {activity.images.map((_, index) => (
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

        {/* Favorite Icon */}
        <TouchableOpacity onPress={() => handleFavorePress(activity.idActP, 'activite_payants', (v) => {
  setFavoredActivities((prev) => ({ ...prev, [activity.idActP]: v }));
}, !!favoredActivities[activity.idActP])} style={styles.favoreIconContainer}>
       
          <Image
            source={require('../assets/favores.png')}
            style={[
              styles.favoreIcon,
              favoredActivities[activity.idActP] && styles.favoreIconActive
            ]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={() => toggleComments(activity.idActP)} style={styles.commentIconContainer}>
          <Image source={require('../assets/chat.png')} style={styles.commentIcon} />
        </TouchableOpacity>
        {expandedComments[activity.idActP] && (
          <CommentSection elementId={activity.idActP} elementType="activite_payants" />
        )}

        {/* Logo et nom de l'entreprise */}
        <View style={styles.companyContainer}>
          {activity.entreprise ? (
            <>
              {/* Affichez le logo de l'entreprise */}
              <Image
                source={
                  activity.entreprise.logoE
                    ? { uri: `http://192.168.100.122:8001/storage/${activity.entreprise.logoE}` }
                    : require('../assets/placeholder.png') // Placeholder si aucun logo
                }
                style={styles.companyLogo}
                onError={(e) => console.log('Erreur lors du chargement du logo:', e.nativeEvent.error)}
                onLoad={() => console.log('Logo chargé avec succès')}
              />
              {/* Affichez le nom de l'entreprise */}
              <Text style={styles.companyName}>{activity.entreprise.nomE}</Text>
            </>
          ) : (
            <Text style={styles.companyName}>Entreprise inconnue</Text>
          )}
        </View>
        <Text style={styles.title}>{activity.nomActP}</Text>


        {/* // Modifiez la section des prix dans le render */}
        {/* //v2.0 */}
        <View style={styles.priceContainer}>
          {activity.offreP ? (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {calculateDiscountedPrice(activity.prixP, activity.offreP)} TND
                </Text>
                <Text style={styles.originalPrice}>
                  {formatDuration(activity.prixP).price} TND
                </Text>
                <Text style={styles.discount}>
                  -{activity.offreP}%
                </Text>
              </View>
              {/* Nouvelle présentation de la durée */}
      <Text style={styles.durationText}>
        {formatDurationText(activity.jours, activity.heure, activity.minute)}
      </Text>
            </>
          ) : (
            <>
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {formatDuration(activity.prixP).price} TND
        </Text>
      </View>
      {/* Nouvelle présentation de la durée */}
      <Text style={styles.durationText}>
        {formatDurationText(activity.jours, activity.heure, activity.minute)}
      </Text>
    </>
          )}
        </View>
        {/* //v1.0 */}
        {/* <View style={styles.priceContainer}>
          {activity.offreP ? (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {calculateDiscountedPrice(activity.prixP, activity.offreP)} TND
                </Text>
                <Text style={styles.originalPrice}>
                  {formatDuration(activity.prixP).price} TND
                </Text>
                <Text style={styles.discount}>
                  -{activity.offreP}%
                </Text>

              </View>
              <View style={styles.durationContainer}>
                {activity.jours && <Text style={styles.durationText}>Pendant: {activity.jours} jours</Text>}
                {activity.heure && <Text style={styles.durationText}>Pendant: {activity.heure} heures</Text>}
                {activity.minute && <Text style={styles.durationText}>Pendant: {activity.minute} minutes</Text>}
              </View>
            </>
          ) : (
            <>

              {formatDuration(activity.prixP).duration && (
                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>Pendant:</Text>
                  <Text style={styles.durationText}>
                    {formatDuration(activity.prixP).duration}
                  </Text>
                </View>
              )}
            </>
          )}
        </View> */}

        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Localisation</Text>
          <Text style={styles.location}>{activity.regionP}</Text>
          <Text style={styles.address}>{activity.lieuP}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{activity.descriptionP}</Text>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Catégorie</Text>
          <Text style={styles.category}>{activity.categorie.nomCat}</Text>
        </View>

        {showReservationForm ? (
          <ReservationForm
            activityId={activity.idActP}
            userId={userId!}
            activity={{
              heure: activity.heure || 0,
              minute: activity.minute || 0,
              jours: activity.jours || 0,
              entreprise_id: activity.entreprise?.id || 0,
              prixP: String(activity.prixP)

            }}
            onSuccess={() => {
              handleReservationSuccess();
              setShowReservationForm(false);
            }}
          />
        ) : (
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => setShowReservationForm(true)}
          >
            <Text style={styles.reserveButtonText}>Réserver maintenant</Text>
          </TouchableOpacity>
        )}
      </View><View style={{
        height: 90
      }}></View>
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
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  companyName: {
    fontSize: 14,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Fond noir
  },
  duration: {
    fontSize: 14,
    color: '#8EB6AD', // Bleu-vert clair
    marginTop: 4,
  },
  durationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  durationText: {
    fontSize: 16,
    color: '#8EB6AD',
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentIconContainer: {

    marginTop: 8,
  },
  commentIcon: {
    width: 24,
    height: 24,

  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },

  imageSlide: {
    height: 300,
  },

  activityImage: {
    width: '100%',
    height: '100%',
  },

  pagination: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discount: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: 'bold',
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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

  favoreIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  commentsContainer: {
    marginTop: 20,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8', // Fond noir
  },

  favoreIcon: {
    width: 24,
    height: 24,
    tintColor: '#8EB6AD', // Default color
  },
  favoreIconActive: {
    tintColor: 'red', // Active color
  },

  contentContainer: {
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D7A738',
    marginBottom: 16,
  },
  priceContainer: {
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
});


export default ActivityDetailScreen;