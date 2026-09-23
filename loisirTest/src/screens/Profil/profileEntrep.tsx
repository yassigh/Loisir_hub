import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {getEntreprise} from '../services/detailService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllActivities, deleteActivity} from '../services/activityService';
import {logoutEntreprise} from '../services/authService';
import {useTheme} from '../../screens/Settings/ThemeContext';
import {api, authApi} from '../services/Api';
import {getEntityImageUrl} from '../services/imageService';
import {getPubliciteImages} from '../services/publiciteService';
import {Linking} from 'react-native';
import {getAllEvent} from '../services/EventService';
import {getAllPostes} from '../services/postService';

interface Entreprise {
  id: number;
  nomE: string;
  email: string;
  adresseE: string;
  lien_facebook_E: string;
  lien_site_E: string;
  logoE?: string; // Facultatif
}
interface Post {
  id: number;
  nomPoste: string;
  descriptionPoste: string;
  typePoste: string;
  entreprise_id: number;
  status: string;
  categorie_id: number;
  created_at: string;
  updated_at: string;
  images?: Array<{url: string}>;
}
interface Event {
  id: number;
  title: string;
  description: string;
  entreprise_id: number;
  date: string;
  images?: Array<{url: string}>;
}
interface Activity {
  idActP: number;
  nomActP: string;
  descriptionP: string;
  lieuP: string;
  regionP: string;
  prixP: number;
  offreP: string;
  entreprise_id: number;
  images?: Array<{url: string}>;
  categorie: {
    nomCat: string;
  };
}
interface PubliciteImage {
  id: number;
  images: Array<{url: string}>;
  date_debut: string;
  jours: number;
}
type RootStackParamList = {
  LoginScreen: undefined;
  AddPost: undefined;
  AddEvennement: undefined;
  UpdateProfilEntreprise: undefined;
  Settings: undefined;
  ActivityComponent: undefined;
  ActivityDetailScreen: {activityId: number};
  EventDetailScreen: {eventId: number};
  PostDetailScreen: {postId: number}; // Added PostDetailScreen
  ConnectablesScreen: {type: string}; // Added ConnectablesScreen
};

const ProfileEntrep = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {isDarkMode, language} = useTheme();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [publicites, setPublicites] = useState<PubliciteImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  //  const activitiesResponse = await api.get('/activites-payantes', {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });

  // if (activitiesResponse.data && activitiesResponse.data.activites_payantes) {
  //   setActivities(Object.values(activitiesResponse.data.activites_payantes));
  // }
  useEffect(() => {
    const fetchEntrepriseDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Token non trouvé');
        }
        const response = await authApi.get('/entreprise/getDetails', {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (response.data && response.data.entreprise) {
          setEntreprise(response.data.entreprise);
        } else {
          console.error(
            "Les données de l'entreprise ne sont pas valides:",
            response.data,
          );
        }

        // Récupérer les événements créés par l'entreprise
        const eventsResponse = await api.get('/entreprise/evenements', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (eventsResponse.data && eventsResponse.data.evenements) {
          setEvents(eventsResponse.data.evenements);
        } else {
          console.error(
            'Les données des événements ne sont pas valides:',
            eventsResponse.data,
          );
        }

        // Récupérer les publications créées par l'entreprise
        const postsResponse = await api.get('/entreprise/postes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (postsResponse.data && postsResponse.data.postes) {
          setPosts(postsResponse.data.postes);
        } else {
          console.error(
            'Les données des publications ne sont pas valides:',
            postsResponse.data,
          );
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    const fetchPublicites = async () => {
      try {
        const data = await getPubliciteImages();
        console.log('Publicites data:', data);
        setPublicites(data);
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
      }
    };
    const fetchAllActivities = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Token non trouvé');
        }

        const response = await api.get('/activites-payantes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.activites_payantes) {
          setActivities(Object.values(response.data.activites_payantes));
        }
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de toutes les activités:',
          error,
        );
      }
    };
    const fetchEntrepriseActivities = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Token non trouvé');
        }

        const response = await api.get('/entreprise/activites-payantes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.activites_payantes) {
          setActivities(Object.values(response.data.activites_payantes));
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des activités de l'entreprise:",
          error,
        );
      }
    };
    const fetchData = async () => {
      await fetchEntrepriseActivities();
    };
    console.log('Post images:', posts.map(post => post.images));
    fetchData();
    fetchAllActivities();
    fetchEntrepriseActivities();
    fetchPublicites();
    fetchEntrepriseDetails();
  }, []);
  useEffect(() => {
    if (publicites.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentImageIndex(prevIndex =>
          prevIndex === publicites.length - 1 ? 0 : prevIndex + 1,
        );
      }, 4000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [publicites]);
  const handleActivityPress = (activity: Activity) => {
    navigation.navigate('ActivityDetailScreen', {activityId: activity.idActP});
  };
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun token trouvé');
      }
      await logoutEntreprise(token);
      await AsyncStorage.removeItem('auth_token');
      Alert.alert('Déconnexion réussie', 'Vous êtes désormais déconnecté.');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      Alert.alert(
        'Erreur',
        'Impossible de vous déconnecter. Veuillez réessayer.',
      );
    }
  };
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir le lien.");
    });
  };
const chunkArray = (array: any[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};
  const getFullImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://192.168.100.122:8000/storage/${path.replace(/^\/+/, '')}`;
};
  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                entreprise?.logoE
                  ? {uri: `http://192.168.100.122:8001/storage/${entreprise.logoE}`}
                  : require('../assets/placeholder.png') // Image par défaut
              }
              style={styles.profileImage}
            />
          </View>

          <TouchableOpacity
            style={styles.adminContainer}
            onPress={() => setMenuVisible(!isMenuVisible)}>
            <Text style={styles.adminText}>Entreprise</Text>
          </TouchableOpacity>

          {isMenuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('UpdateProfilEntreprise')}>
                <Text style={styles.menuText}>Profil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.menuText}>Paramètres</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuText, {color: 'red'}]}>
                  Déconnexion
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => navigation.navigate('Settings')}>
            <Image
              source={require('../assets/settings.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => navigation.navigate('Settings')}>
            <Image
              source={require('../assets/notification.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.activityHeader}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.sectionTitleDark,
            ]}>
            {language === 'English'
              ? 'Welcom'
              : language === 'French'
              ? 'Bonjour'
              : language === 'Arabic'
              ? 'نشاط'
              : 'Bonjour'}
            <Text style={styles.companyName}>
              {' '}
              {entreprise?.nomE || "Nom de l'entreprise"}
            </Text>
          </Text>
        </View>
        <View style={styles.header1}>
          {entreprise?.lien_facebook_E && (
            <TouchableOpacity
              onPress={() => openLink(entreprise.lien_facebook_E)}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>Facebook</Text>
            </TouchableOpacity>
          )}
          {entreprise?.lien_site_E && (
            <TouchableOpacity
              onPress={() => openLink(entreprise.lien_site_E)}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>Site Web</Text>
            </TouchableOpacity>
          )}
        </View>
{/* Ajoute ce bloc pour afficher email et adresse */}
<View style={{marginBottom: 10, marginTop: 5, paddingLeft: 5}}>
  <Text style={{fontSize: 16, color: '#4A7C87', marginBottom: 2}}>
    ✉️ Email : {entreprise?.email ? entreprise.email : 'Non renseigné'}
  </Text>
  <Text style={{fontSize: 16, color: '#4A7C87'}}>
    📍 Adresse : {entreprise?.adresseE ? entreprise.adresseE : 'Non renseigné'}
  </Text>
</View>
       
       
        {/* Publicités */}
        {/* Section publicité */}
        <View style={styles.publiciteContainer}>
          {publicites.length > 0 ? (
            <>
              <Image
                source={{
                  uri: publicites[currentImageIndex].images[0].url,
                  headers: {Accept: '*/*'},
                }}
                style={styles.publiciteImage}
                resizeMode="cover"
                onError={e => {
                  console.log('Publicité image error:', e.nativeEvent.error);
                  console.log(
                    'Current publicite:',
                    publicites[currentImageIndex],
                  );
                }}
                onLoad={() =>
                  console.log('Publicité image loaded successfully')
                }
              />
              <View style={styles.publiciteIndicators}>
                {publicites.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.publicite}>
                <Text style={styles.publiciteDuration}>
                  {publicites[currentImageIndex].jours} jours
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.publicitePlaceholder}>
              <Text style={styles.publicitePlaceholderText}>
                Aucune publicité disponible
              </Text>
            </View>
          )}
        </View>
        <ScrollView style={styles.container}>
          {/* Profil de l'entreprise */}

          {/* Activités */}

          <Text style={styles.sectionTitle}>Activités de l'Entreprise</Text>
          <View style={styles.gridContainer}>
            {activities.length > 0 ? (
              chunkArray(activities, 3).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map(activity => (
                    <TouchableOpacity
                      key={activity.idActP}
                      style={styles.gridItem}
                      onPress={() => handleActivityPress(activity)}>
                      <Image
                        source={
                          activity.images && activity.images.length > 0
                            ? {uri: getFullImageUrl(activity.images[0].url)}
                            : require('../assets/placeholder.png') // Image par défaut
                        }
                        style={styles.gridImage}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.noActivitiesText}>
                Aucune activité disponible
              </Text>
            )}
          </View>
          {/* Événements */}
          <Text style={styles.sectionTitle}>Événements</Text>
          <View style={styles.gridContainer}>
            {events.length > 0 ? (
              chunkArray(events, 3).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map(event => (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.gridItem}
                      onPress={() =>
                        navigation.navigate('EventDetailScreen', {
                          eventId: event.id,
                        })
                      }>
                      <Image
                        source={
                          event.images && event.images.length > 0
                            ? {uri: getFullImageUrl(event.images[0].url)}
                            : require('../assets/placeholder.png') // Image par défaut
                        }
                        style={styles.gridImage}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>
                Aucun événement disponible
              </Text>
            )}
          </View>
          {/* Publications */}
         <Text style={styles.sectionTitle}>Publications</Text>
<View style={styles.gridContainer}>
{posts.length > 0 ? (
  chunkArray(posts, 3).map((row, rowIndex) => (
    <View key={rowIndex} style={styles.gridRow}>
      {row.map(post => {
        const imageUrl =
          post.images && post.images.length > 0 && post.images[0].url
  ? getFullImageUrl(post.images[0].url)
  : null
        console.log('Post:', post.nomPoste, 'Image URL:', imageUrl);
        return (
          <TouchableOpacity
            key={post.id}
            style={styles.gridItem}
            onPress={() => navigation.navigate('PostDetailScreen', { postId: post.id })}
          >
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../assets/placeholder.png')
              }
              style={styles.gridImage}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  ))
) : (
  <Text style={styles.noPostsText}>Aucune publication disponible</Text>
)}
</View>
        </ScrollView>
      </ScrollView>{' '}
      {/* Icône Messenger fixe */}
      <TouchableOpacity
        style={styles.messengerIconContainer}
        onPress={() =>
          navigation.navigate('ConnectablesScreen', {type: 'entreprise'})
        }>
        <Image
          source={require('../assets/messager.png')}
          style={styles.messengerIcon}
        />
      </TouchableOpacity>{' '}
    </View>
  );
};

const styles = StyleSheet.create({
  messengerIconContainer: {
    position: 'absolute',
    bottom: 100, // Distance depuis le bas
    right: 20, // Distance depuis la droite
    width: 60, // Taille du conteneur
    height: 60,
    borderRadius: 30, // Cercle
    backgroundColor: '#fff', // Fond blanc
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5, // Ombre pour Android
    zIndex: 100, // Assurez-vous que l'icône est au-dessus du contenu
  },
  messengerIcon: {
    width: 30, // Taille de l'icône
    height: 30,
    tintColor: '#4A7C87', // Couleur de l'icône
  },
  gridContainer: {
    marginVertical: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 5,
    aspectRatio: 1, // Ensures the item is square
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  horizontalScroll: {
    paddingHorizontal: 10,
  },
  postItem: {
    marginHorizontal: 5,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  noEventsContainer: {
    width: 250,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },

  noEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  eventItem: {
    marginHorizontal: 10,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noPostsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  eventImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  eventLocation: {
    fontSize: 14,
    color: '#8EB6AD',
    marginTop: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  postCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  postContent: {
    fontSize: 14,
    color: '#555',
  },
  eventCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },

  linkText: {
    fontSize: 16,
    color: '#D7A738',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  activities: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  activityCard: {
    marginRight: 10,
    alignItems: 'center',
  },
  activityImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  activityName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  publiciteContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  publiciteDuration: {
    color: '#fff',
    fontSize: 12,
  },
  publicite: {
    height: 150,
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  publiciteImage: {
    width: '100%',
    height: '100%',
  },

  publicitePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },

  publicitePlaceholderText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  publiciteIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 3,
  },

  indicatorActive: {
    backgroundColor: '#fff',
  },
  publicites: {flexDirection: 'row', marginVertical: 10},

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pour espacer les éléments
    paddingHorizontal: 20,
    marginTop: 20,
  },
  companyName: {fontSize: 20, fontWeight: 'bold', marginTop: 10},

  seeAllTextDark: {
    color: '#D7A738',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  greetingDark: {
    color: '#fff',
  },
  containerDark: {
    backgroundColor: '#333',
  },

  activityText: {marginTop: 5, fontSize: 14, fontWeight: '500'},
  menu: {
    marginTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A7C87',
    width: 120,
    position: 'absolute',
    top: 50,
    zIndex: 1,
  },
  menuItem: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  iconsContainer: {
    flexDirection: 'row', // Aligner horizontalement
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 20, // Ajuster la position à droite au lieu de left: 300
  },
  iconWrapper: {
    width: 40, // Taille du cercle
    height: 40, // Taille du cercle
    borderRadius: 20, // Rendre le fond circulaire
    backgroundColor: '#FFFF', // Couleur du fond
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Espace entre les icônes
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5, // Ombre pour Android
  },
  icon: {
    width: 20, // Réduction de la taille de l'icône
    height: 20, // Réduction de la taille de l'icône
    tintColor: '#D7A738', // Couleur de l'icône
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header1: {},
  profileImageContainer: {
    position: 'absolute',
    left: 10, // Ajuste la distance de la gauche
    width: 60, // Ajuste la taille du cercle
    height: 60,
    borderRadius: 30, // Cercle parfait
    backgroundColor: '#fff', // Fond blanc pour bien ressortir
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Ombre pour Android
  },
  seeAllContainer: {
    flexDirection: 'row', // Aligner le texte et l'icône horizontalement
    alignItems: 'center',
    backgroundColor: 'transparent', // Pas de fond pour un effet propre
    padding: 5,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7A738', // Couleur dorée
    marginRight: 5, // Espacement entre le texte et l'icône
  },
  seeAllIcon: {
    fontSize: 18,
    color: '#D7A738', // Couleur dorée pour la flèche
  },
  adminContainer: {
    backgroundColor: '#fff', // Fond blanc
    padding: 10,
    borderTopLeftRadius: 40, // Coin supérieur gauche
    borderTopRightRadius: 20, // Coin supérieur droit
    borderBottomLeftRadius: 20, // Coin inférieur gauche
    borderBottomRightRadius: 40, // Coin inférieur droit
    borderWidth: 2, // Épaisseur de la bordure
    borderColor: '#4A7C87', // Couleur de la bordure (noir)
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    marginLeft: 80,
  },
  adminText: {
    fontSize: 16,
    width: 100,
    fontWeight: 'bold',
    color: '#D7A738', // Texte en blanc pour contraste
  },
  greeting: {fontSize: 24, fontWeight: 'bold', marginVertical: 10},
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seeAll: {fontSize: 14, color: '#ff9900'},

  activityPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#ddd',
    marginRight: 10,
    borderRadius: 10,
  },
  orderStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  statusButton: {
    backgroundColor: '#fff', // Fond blanc
    padding: 10,
    borderTopLeftRadius: 40, // Coin supérieur gauche
    borderTopRightRadius: 20, // Coin supérieur droit
    borderBottomLeftRadius: 20, // Coin inférieur gauche
    borderBottomRightRadius: 40, // Coin inférieur droit
    borderWidth: 2, // Épaisseur de la bordure
    borderColor: '#4A7C87', // Couleur de la bordure (noir)
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7A738',
  },
  cardContainer: {
    backgroundColor: '#fff', // Fond blanc pour la carte
    borderRadius: 15, // Coins arrondis pour un effet doux
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Ombre sur Android
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Cercle pour le logo
    backgroundColor: '#D7A738', // Couleur dorée pour le fond du logo
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A7C87', // Texte en bleu-vert
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7A738', // Prix en doré
  },
  deleteButton: {
    backgroundColor: '#4A7C87', // Bouton bleu-vert
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#fff', // Icône blanche
    fontSize: 20,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  addButton: {
    alignSelf: 'center',
    backgroundColor: '#ff9900',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 20,
  },
  linkContainer: {
    marginBottom: 10, // Espacement entre les liens
  },
});

export default ProfileEntrep;
