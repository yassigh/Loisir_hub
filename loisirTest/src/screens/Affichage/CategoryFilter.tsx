import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { getAllActivities } from '../services/activityService';
import { getAllEvent } from '../services/EventService';
import { getAllPostes } from '../services/postService';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getEntityImageUrl } from '../services/imageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createFavore, deleteFavore, getFavores } from '../services/FavoreService';

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

type RootStackParamList = {
  ActivityDetailScreen: { activityId: number };
  EventDetailScreen: { eventId: number };
  PostDetailScreen: { postId: number };
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface Activity {
  idActP: number;
  nomActP: string;
  descriptionP: string;
  lieuP: string;
  regionP: string;
  prixP: number;
  offreP: string;
  images?: Array<{ url: string }>;
  categorie: {
    nomCat: string;
  };
}
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
}
interface Post {
  id: number;
  nomPoste: string;
  descriptionPoste: string;
  lieuPoste: string;
  regionPoste: string;
  images?: Array<{ url: string }>;
  categorie: {
    nomCat: string;
  };
}

const CategoryFilter = () => {
  const route = useRoute();
  const { categoryId, categoryName } = route.params as { categoryId: number, categoryName: string };
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigation = useNavigation<NavigationProps>();
  const [favoredItems, setFavoredItems] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getAllActivities();
        const eventsData = await getAllEvent();
        const postsData = await getAllPostes();

        setActivities(activitiesData.filter((activity: Activity) => activity.categorie.nomCat === categoryName));
        setEvents(eventsData.filter((event: Event) => event.categorie.nomCat === categoryName));
        setPosts(postsData.filter((post: Post) => post.categorie.nomCat === categoryName));
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
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
        console.log('userId', userId);
    
        // Récupère les favoris pour l'utilisateur connecté
        const favoresData = await getFavores(userId);
        const favoredMap: { [key: string]: boolean } = {};
        favoresData.forEach((favore: Favore) => {
          if (favore.user_id.toString() === userId) {
            // Utilise une clé unique basée sur entity_type et entity_id
            const key = `${favore.entity_type}_${favore.entity_id}`;
            favoredMap[key] = true;
          }
        });
        console.log('favores', favoredMap);
        setFavoredItems(favoredMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
      }
    };
    fetchFavores();

    fetchData();
  }, [categoryId, categoryName]);

  if (loading) {
    return <Text>Chargement...</Text>;
  }

  const filteredData = () => {
    switch (filter) {
      case 'activities':
        return activities;
      case 'events':
        return events;
      case 'posts':
        return posts;
      default:
        return [...activities, ...events, ...posts];
    }
  };
  const getItemImage = (item: Activity | Event | Post): string => {
    if (!item.images || !item.images[0]) {
      return 'https://via.placeholder.com/150';
    }
  
    if ('idActP' in item) {
      return getEntityImageUrl(item.images[0].url, 'activites-payantes');
    } else if ('nomEvent' in item) {
      return getEntityImageUrl(item.images[0].url, 'evenements');
    } else if ('nomPoste' in item) {
      return getEntityImageUrl(item.images[0].url, 'postes');
    }
  
    return 'https://via.placeholder.com/150';
  };
  const handleFavorePress = async (item: Activity | Event | Post, type: string) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found');
      }
  
      const favoreData = {
        user_id: userId,
        entity_id: 'idActP' in item ? item.idActP : item.id,
        entity_type: type === 'activity' ? 'activite_payants' : type === 'event' ? 'evenements' : 'postes',
        event_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
  
      const itemId = 'idActP' in item ? item.idActP : item.id;
  
      if (favoredItems[itemId]) {
        // Supprimer des favoris
        await deleteFavore(itemId);
        setFavoredItems((prev) => ({
          ...prev,
          [itemId]: false,
        }));
        Alert.alert('Succès', 'Favori supprimé avec succès');
      } else {
        // Ajouter aux favoris
        await createFavore(favoreData);
        setFavoredItems((prev) => ({
          ...prev,
          [itemId]: true,
        }));
        Alert.alert('Succès', 'Ajouté aux favoris');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la gestion des favoris');
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
      <View style={styles.header}>
        <Text style={styles.title}>{categoryName}</Text>
      </View>
  <Image source={require('../assets/logo.png')}style={{width:170, height:45, resizeMode: "contain", left: 230, top:-50}}/>
        
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.filterButtonSelected]}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextSelected]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('activities')} style={[styles.filterButton, filter === 'activities' && styles.filterButtonSelected]}>
          <Text style={[styles.filterText, filter === 'activities' && styles.filterTextSelected]}>Activités</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('events')} style={[styles.filterButton, filter === 'events' && styles.filterButtonSelected]}>
          <Text style={[styles.filterText, filter === 'events' && styles.filterTextSelected]}>Événements</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('posts')} style={[styles.filterButton, filter === 'posts' && styles.filterButtonSelected]}>
          <Text style={[styles.filterText, filter === 'posts' && styles.filterTextSelected]}>Postes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {filteredData().map((item, index) => (
        <TouchableOpacity
        key={index}
        style={styles.card}
        onPress={() => {
          if ('idActP' in item) {
            navigation.navigate('ActivityDetailScreen', { activityId: item.idActP });
          } else if ('id' in item && 'nomEvent' in item) {
            navigation.navigate('EventDetailScreen', { eventId: item.id });
          } else if ('id' in item && 'nomPoste' in item) {
            navigation.navigate('PostDetailScreen', { postId: item.id });
          }
        }}
      >
<Image
  source={
    getItemImage(item) && getItemImage(item) !== 'https://via.placeholder.com/150'
      ? { uri: getItemImage(item), headers: { Accept: '*/*' } }
      : require('../assets/placeholder.png')
  }
  style={styles.image}
  resizeMode="cover"
  onError={(e) => {
    // Optionnel : tu peux gérer un état pour afficher le placeholder si erreur
    console.log('Image loading error:', e.nativeEvent.error, 'for URL:', getItemImage(item));
  }}
/>
<TouchableOpacity
  style={styles.favoreIconContainer}
  onPress={() => handleFavorePress(item, 'idActP' in item ? 'activity' : 'nomEvent' in item ? 'event' : 'post')}
>
  <Image
    source={require('../assets/favores.png')}
    style={[
      styles.favoreIcon,
      favoredItems[
        `${'idActP' in item ? 'activite_payants' : 'nomEvent' in item ? 'evenements' : 'postes'}_${'idActP' in item ? item.idActP : item.id}`
      ] && styles.favoreIconActive,
    ]}
  />
</TouchableOpacity>
            <Text style={styles.itemName}>{'nomActP' in item ? item.nomActP : 'nomEvent' in item ? item.nomEvent : item.nomPoste}</Text>
            <Text style={styles.itemDescription}>
              {'descriptionP' in item ? item.descriptionP : 'descriptionEvent' in item ? item.descriptionEvent : item.descriptionPoste}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },

  decorImage: {
    position: 'absolute',
    width: 390,
    height: 290,
  },
  favoreIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  favoreIcon: {
    width: 20,
    height: 20, tintColor: '#8EB6AD', 
  },
  favoreIconActive: {
    tintColor: 'red', // Active color
  },
  topLeft: {
    top: 0,
    left: -90,
  },
 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D7A738',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8EB6AD',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  filterButtonSelected: {
    backgroundColor: '#8EB6AD',
  },
  filterText: {
    color: '#8EB6AD',
    fontWeight: 'bold',
  },
  filterTextSelected: {
    color: '#fff',
  },
  gridContainer: {
   
    flexWrap: 'wrap',
    width:'200%'
   
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#D7A738',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default CategoryFilter;