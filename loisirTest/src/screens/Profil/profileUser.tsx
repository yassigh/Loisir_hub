import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {logoutUser, getUserDetails} from '../services/authService';
import {useTheme} from '../../screens/Settings/ThemeContext';
import {getAllActivities} from '../services/activityService';
import {
  getFavores,
  createFavore,
  deleteFavore,
} from '../services/FavoreService';
import {getEntityImageUrl} from '../services/imageService';
import {getPubliciteImages} from '../services/publiciteService';
import {authApi} from '../services/Api';

type RootStackParamList = {
  ActivityComponent: undefined;
  UpdateProfileUser: undefined;
  LoginScreen: undefined;
  Settings: undefined;
  CartScreen: undefined;
  ActivityDetailScreen: {activityId: number};
  SelectInterests: undefined;
  ConnectablesScreen: {type: string};
  NotificationScreen: undefined; // <-- Add this line
};

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'UpdateProfileUser'
>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {isDarkMode, language} = useTheme();
  interface User {
    last_name: string;
    first_name: string;
    email: string;
    imageU?: string;
  }
  interface Activity {
    idActP: number;
    nomActP: string;
    descriptionP: string;
    lieuP: string;
    regionP: string;
    prixP: number;
    offreP: string;
    images?: Array<{url: string}>;
    categorie: {
      nomCat: string;
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
  interface Category {
    id: number;
    nomCat: string;
  }
  interface PubliciteImage {
    id: number;
    images: Array<{url: string}>;
    date_debut: string;
    jours: number;
  }
  const [user, setUser] = useState<User | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [publicites, setPublicites] = useState<PubliciteImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [favoredActivities, setFavoredActivities] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchPublicites = async () => {
      try {
        const data = await getPubliciteImages();
        console.log('Publicites data:', data);
        setPublicites(data);
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
      }
    };
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          Alert.alert('Erreur', 'Vous devez être connecté');
          navigation.replace('LoginScreen');
          return;
        }

        const userDetails = await getUserDetails(token);
        if (userDetails) {
          console.log('Données utilisateur récupérées:', userDetails);
          setUser(userDetails);
        }
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des données utilisateur:',
          error,
        );
        if (error instanceof Error && error.message === 'Session expirée') {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
          await AsyncStorage.removeItem('auth_token'); // Supprimez le token expiré
          navigation.replace('LoginScreen'); // Redirigez vers l'écran de connexion
        } else {
          Alert.alert(
            'Erreur',
            'Impossible de récupérer les données utilisateur',
          );
        }
      }
    };
    const fetchActivities = async () => {
      try {
        const data = await getAllActivities();
        setActivities(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
      }
    };
    const fetchFavores = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User ID not found');
        }
        const favoresData = await getFavores(userId);
        const favoredActivitiesMap: {[key: number]: boolean} = {};
        favoresData.forEach((favore: Favore) => {
          if (favore.entity_type === 'activite_payants') {
            favoredActivitiesMap[favore.entity_id as number] = true;
          }
        });
        setFavoredActivities(favoredActivitiesMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des favores:', error);
      }
    };
    const fetchUnreadNotificationsCount = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const response = await authApi.get('/notifications/unread-count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUnreadNotifications(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
    fetchUnreadNotificationsCount();
    fetchPublicites();
    fetchFavores();
    fetchActivities();
    fetchUserData();
  }, [navigation]);
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

  const handleFavorePress = async (activity: Activity) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      throw new Error('User ID not found');
    }

    if (favoredActivities[activity.idActP]) {
      // Récupérer l'ID du favori à partir des données des favoris
      const favoresData = await getFavores(userId);
      const favore = favoresData.find(
        (favore: Favore) =>
          Number(favore.entity_id) === activity.idActP && favore.entity_type === 'activite_payants'
      );
      if (favore) {
        await deleteFavore(favore.id);
        setFavoredActivities(prev => {
          const updated = { ...prev };
          delete updated[activity.idActP];
          return updated;
        });
        Alert.alert('Succès', 'Activité supprimée des favoris');
      } else {
        Alert.alert('Erreur', 'Favori non trouvé.');
      }
    } else {
      // Ajouter aux favoris
      const favoreData = {
        user_id: userId,
        entity_id: activity.idActP,
        entity_type: 'activite_payants',
        event_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      await createFavore(favoreData);
      setFavoredActivities(prev => ({
        ...prev,
        [activity.idActP]: true,
      }));
      Alert.alert('Succès', 'Activité ajoutée aux favoris');
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    Alert.alert('Erreur', 'Impossible de gérer les favoris');
  }
};
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        await logoutUser(token);
      }
      await AsyncStorage.removeItem('auth_token');
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert(
        'Erreur',
        'Impossible de se déconnecter. Veuillez réessayer.',
      );
    }
  };

  return (
      <View style={{flex: 1}}>
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Image de profil */}
        <View style={styles.notificationContainer}></View>
        <View style={styles.profileImageContainer}>
          <Image
            source={
              user?.imageU
                ? {uri: `http://192.168.100.122:8001/storage/${user.imageU}`}
                : require('../assets/user.png') // Image par défaut
            }
            style={styles.profileImage}
          />
        </View>

        <TouchableOpacity
          style={styles.adminContainer}
          onPress={() => setMenuVisible(!isMenuVisible)}>
          <Text style={styles.adminText}>Utilisateur</Text>
        </TouchableOpacity>
        {/* Liste déroulante */}
        {isMenuVisible && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('UpdateProfileUser')}>
              <Text style={styles.menuText}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.menuText}>Paramètres</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('CartScreen')}>
              <Text style={styles.menuText}>Panier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuText, {color: 'red'}]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton pour afficher la liste déroulante */}
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => navigation.navigate('CartScreen')}>
          <Image
            source={require('../assets/shopping-bag.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => navigation.navigate('Settings')}>
          <Image
            source={require('../assets/settings.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
        {/* Bouton pour naviguer vers une autre page */}
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => navigation.navigate('Settings')}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}>
            <Image
              source={require('../assets/notification.png')}
              style={{width: 70, height: 25, resizeMode: 'contain'}}
            />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <Text style={[styles.greeting, isDarkMode && styles.greetingDark]}>
        {language === 'English' ? 'Hello' : 'Bonjour'},{' '}
        {user?.first_name || 'User'}!
      </Text>

      {/* Section Activity */}
      <View style={styles.activityHeader}>
        <Text style={styles.sectionTitle}>Activités</Text>
        <TouchableOpacity
          style={styles.seeAllContainer}
          onPress={() => navigation.navigate('ActivityComponent')}>
          <Text
            style={[styles.seeAllText, isDarkMode && styles.seeAllTextDark]}>
            {language === 'English' ? 'See All' : 'Voir tout'}
          </Text>

          <Image
            source={require('../assets/right-arrow.png')}
            style={{width: 15, height: 15}}
          />
        </TouchableOpacity>
      </View>

      {/* Images des activités */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.activities}>
        {activities.map(activity => (
          <TouchableOpacity
            key={activity.idActP}
            onPress={() => handleActivityPress(activity)}
            style={styles.activityCard}>
            <Image
              source={
                activity.images && activity.images.length > 0
                  ? {
                      uri: getEntityImageUrl(
                        activity.images[0].url,
                        'activities',
                      ),
                    }
                  : require('../assets/placeholder.png')
              }
              style={styles.activityImage}
            />
            <TouchableOpacity
              style={styles.favoreIconContainer}
              onPress={() => handleFavorePress(activity)}>
              <Image
                source={require('../assets/favores.png')}
                style={[
                  styles.favoreIcon,
                  favoredActivities[activity.idActP] && styles.favoreIconActive,
                ]}
              />
            </TouchableOpacity>
            <Text style={styles.activityName}>{activity.nomActP}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* My Orders */}
      <Text style={styles.sectionTitle}>
        Pour {user?.first_name || 'User'}!
      </Text>
      <View style={styles.orderStatus}>
        <View style={styles.orderStatus}>
          <TouchableOpacity
            style={styles.statusButton}
            onPress={
              () => navigation.navigate('SelectInterests') // Navigation directe vers SelectInterests
            }>
            <Text style={styles.statusText}>Centre d'intérêt</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Section publicité */}
      <View style={styles.publiciteContainer}>
        {publicites.length > 0 ? (
          <>
            <Image
              source={{
                uri: publicites[currentImageIndex]?.images[0]?.url, // Utilisez l'URL corrigée
              }}
              style={styles.publiciteImage}
              resizeMode="cover"
              onError={e => {
                console.log(
                  "Erreur lors du chargement de l'image de publicité:",
                  e.nativeEvent.error,
                );
              }}
              onLoad={() =>
                console.log('Image de publicité chargée avec succès')
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
          </>
        ) : (
          <View style={styles.publicitePlaceholder}>
            <Text style={styles.publicitePlaceholderText}>
              Aucune publicité disponible
            </Text>
          </View>
        )}
      </View>
      <View style={{height: 100}}></View>
        
      </ScrollView>    
      {/* Icône Messenger fixe */}
      <TouchableOpacity
        style={styles.messengerIconContainer}
        onPress={() =>
          navigation.navigate('ConnectablesScreen', {type: 'user'})
        }>
        <Image
          source={require('../assets/messager.png')}
          style={styles.messengerIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 55,
    right: 150,
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 20,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
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
  publicitePlaceholderText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  publiciteContainer: {
    height: 240,
    width: '100%',
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
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
  activityCard: {
    marginRight: 15,
    width: 120,
  },
  activityImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  activityName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
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
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'absolute',
    left: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
  profileImage: {width: '100%', height: '100%', borderRadius: 30},
  adminContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 40,
    borderWidth: 2,
    borderColor: '#4A7C87',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    marginLeft: 100,
  },
  adminText: {fontSize: 12, fontWeight: 'bold', color: '#D7A738'},
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
  menuText: {fontSize: 14, fontWeight: 'bold', color: '#333'},
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {width: 20, height: 20, tintColor: '#D7A738'},
  greeting: {fontSize: 24, fontWeight: 'bold', marginVertical: 10},
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {fontSize: 18, fontWeight: 'bold', marginTop: 20},
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 5,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7A738',
    marginRight: 5,
  },
  seeAllIcon: {fontSize: 18, color: '#D7A738'},
  activities: {flexDirection: 'row', marginVertical: 10},
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
    backgroundColor: '#fff',
    padding: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 40,
    borderWidth: 2,
    borderColor: '#4A7C87',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  statusText: {fontSize: 14, fontWeight: 'bold', color: '#D7A738'},
});

export default ProfileScreen;
