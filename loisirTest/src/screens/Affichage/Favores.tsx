import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { getFavores, deleteFavore } from '../services/FavoreService';
import { getPostById } from '../services/postService';
import { getEvent } from '../services/EventService';
import { getActivityById } from '../services/activityService';
import { getUserByIdd } from '../services/authService'; // Import the new service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { AuthContext } from '../../AuthContext'; // Importez le contexte AuthContext
import { getEntityImageUrl } from '../services/imageService'; // Import the image helper


const Favores = ({ navigation }: { navigation: NavigationProp<any> }) => {
  interface Favore {
    id: string | number;
    entity_id: string | number;
    entity_type: string;
    event_date: string;
    title?: string;
    image?:  string ;
  
    user_name?: string; // Add user_name property
    user_id: string | number; // Add user_id property
  }

  const { isLoggedIn, token } = useContext(AuthContext); // Utilisez le contexte AuthContext
  const [favores, setFavores] = useState<Favore[]>([]);
  const [filteredFavores, setFilteredFavores] = useState<Favore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const handleDeleteFavore = async (favoreId: string | number) => {
    try {
      await deleteFavore(favoreId); // Appelle la fonction de suppression
      setFavores((prevFavores) => prevFavores.filter((favore) => favore.id !== favoreId));
      setFilteredFavores((prevFilteredFavores) => prevFilteredFavores.filter((favore) => favore.id !== favoreId));
      Alert.alert('Succès', 'Le favori a été supprimé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression du favori :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du favori.');
    }
  };
  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigation.navigate('choisiType'); // Redirigez vers choisiType si l'utilisateur n'est pas connecté
      return;
    }

    const fetchFavores = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User ID not found');
        }
        const favoresData = await getFavores(userId);
        setFavores(favoresData);
setFilteredFavores(favoresData);
       const favoresWithDetails = await Promise.all(
  favoresData.map(async (favore: Favore) => {
    let title = '';
    let image = '';
    let user_name = '';
    try {
      if (favore.entity_type === 'postes') {
        const post = await getPostById(favore.entity_id);
        title = post.nomPoste;
        image = post.images ? getEntityImageUrl(post.images[0].url, 'posts') : null;
      } else if (favore.entity_type === 'evenements') {
        const event = await getEvent(favore.entity_id);
        title = event.nomEvent;
        image = event.images ? getEntityImageUrl(event.images[0].url, 'events') : null;
      } else if (favore.entity_type === 'activite_payants') {
        const activity = await getActivityById(favore.entity_id);
        title = activity.nomActP;
        image = activity.images && activity.images.length > 0
          ? getEntityImageUrl(activity.images[0].url, 'activities')
          : null;
      }
      const user = await getUserByIdd(favore.user_id);
      user_name = `${user.first_name} ${user.last_name}`;
    } catch (error) {
      console.error('Erreur mapping favori:', error);
    }
    return { ...favore, title, image, user_name };
  })
);
        setFavores(favoresWithDetails);
        setFilteredFavores(favoresWithDetails); 
      } catch (error) {
        console.error('Error fetching favores:', error);
     
      } finally {
        setLoading(false);
      }
    };

    fetchFavores();
  }, [isLoggedIn, token, navigation]);



  const applyFilter = (type: string | null) => {
    setFilterType(type);
    let mappedType = null;
  
    if (type === 'post') mappedType = 'postes';
    else if (type === 'event') mappedType = 'evenements';
    else if (type === 'activity') mappedType = 'activite_payants';
    if (mappedType) {
      setFilteredFavores(favores.filter(favore => favore.entity_type === mappedType));
    } else {
      setFilteredFavores([...favores]); // Re-display all favores if no filter
    }

    setFilterType(type);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Favore }) => (
    <TouchableOpacity
      style={styles.favoreItem}
      onPress={() => {
        if (item.entity_type === 'postes') {
          navigation.navigate('PostDetailScreen', { postId: item.entity_id });
        } else if (item.entity_type === 'evenements') {
          navigation.navigate('EventDetailScreen', { eventId: item.entity_id });
        } else if (item.entity_type === 'activite_payants') {
          navigation.navigate('ActivityDetailScreen', { activityId: item.entity_id });
        }
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            item.image
              ? { uri: getEntityImageUrl(item.image) }
              : require('../assets/placeholder.png') // Image par défaut si aucune image n'est disponible
          }
          style={styles.favoreImage}
          onError={() => console.log(`Erreur lors du chargement de l'image : ${item.image}`)}
          onLoad={() => console.log(`Image chargée avec succès : ${item.image}`)}
        />
        {/* Icône de suppression */}
        <TouchableOpacity
          style={styles.deleteIconContainer}
          onPress={() => handleDeleteFavore(item.id)}
        >
          <Image
            source={require('../assets/poubelle.png')} // Assurez-vous d'avoir une icône de suppression
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.favoreContent}>
        <Text style={styles.favoreTitle}>{item.title}</Text>
        <Text style={styles.favoreText}>Type: {item.entity_type}</Text>
        <Text style={styles.favoreText}>Ajouté à la liste le: {item.event_date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/logo.png')}style={{width:120, height:40}}/>
        <Text style={styles.header}> Favoris</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={require('../assets/filter.png')} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A7C87" />
      ) : filteredFavores.length === 0 ? (
        <Text style={styles.noFavores}>Aucun favori trouvé.</Text>
      ) : (
        <FlatList
          data={filteredFavores}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrer par type</Text>
            <TouchableOpacity onPress={() => applyFilter(null)}>
              <Text style={styles.filterOption}>Tout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter('post')}>
              <Text style={styles.filterOption}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter('event')}>
              <Text style={styles.filterOption}>Événements</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter('activity')}>
              <Text style={styles.filterOption}>Activités</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative', // Permet de positionner l'icône au-dessus de l'image
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 5, // Positionnez l'icône en haut
    right: 5, // Positionnez l'icône à droite
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
    borderRadius: 15, // Rond
    padding: 5, // Espacement autour de l'icône
  },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  filterButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, width: 250, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  filterOption: { fontSize: 16, marginVertical: 5, color: '#4A7C87' },
  closeButton: { marginTop: 10, padding: 10, backgroundColor: '#D7A738', borderRadius: 5 },
  closeButtonText: { color: '#FFF', fontWeight: 'bold' },
  container: { flex: 1, padding: 20, backgroundColor: '#F8F8F8' },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 15,
    paddingHorizontal: 10
  },
  decorImage: {
    position: 'absolute',
    width: 390,
    height: 320,
  },
  topLeft: {
    top: -120,
    left: -110,
  },
  topLeftLower: {
    top: -100,
    left: -100,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#D7A738' 
  },
  filterIcon: { 
    width: 30, 
    height: 30 
  },
  noFavores: { fontSize: 18, textAlign: 'center', marginTop: 20, color: '#4A7C87' },
  favoreItem: { flexDirection: 'row', padding: 15, marginVertical: 5, backgroundColor: '#FFF', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  favoreImage: { width: 85, height: 85, borderRadius: 10, marginRight: 10 },
  favoreContent: { flex: 1 },
  favoreTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A7C87' },
  favoreText: { fontSize: 14, color: '#8EB6AD' },
  deleteIcon: { width: 25, height: 25, tintColor: '#D7A738', marginTop: 10 },
  filterText: { fontSize: 16, color: '#4A7C87', textAlign: 'center' }
});

export default Favores;