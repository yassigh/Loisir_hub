import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from 'react-native';
import { getAllEvent } from '../services/EventService';
import { getCategories } from '../services/categoriesService';
import CommentSection from './CommentSection';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFavores, createFavore,suppFavore } from '../services/FavoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntityImageUrl } from '../services/imageService';

import { getEntityImageUrlq } from '../services/imageService';
import delegations from './delegations';
import { getAllEntreprises } from '../services/authService';

type RootStackParamList = {
  EventList: undefined;
  EventDetailScreen: { eventId: number };
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

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

const EventComponent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const navigation = useNavigation<NavigationProps>();
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null);
   const [availableDelegations, setAvailableDelegations] = useState<string[]>([]);
 const [regionModalVisible, setRegionModalVisible] = useState(false);
   const [delegationModalVisible, setDelegationModalVisible] = useState(false);
  const [favoredEvents, setFavoredEvents] = useState<{ [key: number]: boolean }>({});
  const regions = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

const filteredEvents = events.filter(event => {
  const matchesFilter = filter ? event.nomEvent.toLowerCase().includes(filter.toLowerCase()) : true;
  const matchesCategory = selectedCategory ? event.categorie.nomCat === categories.find(cat => cat.id === selectedCategory)?.nomCat : true;
  const matchesRegion = selectedRegion ? event.regionEvent === selectedRegion : true;
  const matchesDelegation = selectedDelegation ? event.lieuEvent === selectedDelegation : true;

  return matchesFilter && matchesCategory && matchesRegion && matchesDelegation;
});
useEffect(() => {
  const fetchEventsAndEntreprises = async () => {
    try {
      setLoading(true);

      // Récupérez les événements et les entreprises
      const [eventsData, entreprisesData] = await Promise.all([
        getAllEvent(),
        getAllEntreprises(),
      ]);

      console.log('Events data:', eventsData); // Debug les données des événements
      console.log('Entreprises data:', entreprisesData); // Debug les données des entreprises

      // Mappez les entreprises par leur ID
      const entreprisesMap = entreprisesData.reduce((map: { [key: number]: { nomE: string; logoE: string | null } }, entreprise: { id: number; nomE: string; logoE: string | null }) => {
        map[entreprise.id] = { nomE: entreprise.nomE, logoE: entreprise.logoE };
        return map;
      }, {});

      // Ajoutez les informations des entreprises aux événements
      const eventsWithEntreprises = eventsData.map((event) => ({
        ...event,
        entreprise: entreprisesMap[event.entreprise_id] || { nomE: 'Entreprise inconnue', logoE: null },
      }));

      console.log('Events with entreprises:', eventsWithEntreprises); // Debug les événements avec entreprises

      setEvents(eventsWithEntreprises);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur lors de la récupération des données');
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
      console.log('Favores récupérés:', favoresData);

      const favoredActivitiesMap: { [key: number]: boolean } = {};
      favoresData.forEach((favore: Favore) => {
        if (favore.entity_type === 'evenements') {
          favoredActivitiesMap[favore.entity_id as number] = true;
        }
      });
      setFavoredEvents(favoredActivitiesMap);
    } catch (error) {
      console.error('Erreur lors de la récupération des favores:', error);
    }
  };
  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    }
  };

  fetchCategories();
  fetchFavores();
  fetchEventsAndEntreprises();
}, []);
const handleCategorySelect = (categoryId: number | null) => {
  setSelectedCategory(categoryId);
};
  const toggleComments = (eventId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

 const handleFavorePress = async (event: Event) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) throw new Error('User ID not found');

    if (favoredEvents[event.id]) {
      // Récupérer l'ID du favori à partir des données des favoris
      const favoresData = await getFavores(userId);
      const favore = favoresData.find(
        (favore: Favore) =>
          favore.entity_id === event.id && favore.entity_type === 'evenements'
      );

      if (favore) {
        // Appeler la fonction de suppression avec l'ID du favori
        await suppFavore(favore.id);
        setFavoredEvents((prev) => {
          const updated = { ...prev };
          delete updated[event.id];
          return updated;
        });
        Alert.alert('Succès', 'Événement supprimé des favoris');
      } else {
        Alert.alert('Erreur', 'Favori non trouvé.');
      }
    } else {
      // Ajouter aux favoris
      const favoreData = {
        user_id: userId,
        entity_id: event.id,
        entity_type: 'evenements',
        event_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      await createFavore(favoreData);
      setFavoredEvents((prev) => ({
        ...prev,
        [event.id]: true,
      }));
      Alert.alert('Succès', 'Événement ajouté aux favoris');
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    Alert.alert('Erreur', 'Impossible de gérer les favoris');
  }
};
 

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetailScreen', { eventId: event.id });
  };

  if (loading) {
    return <Text>Chargement des événements...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }



  const debugImageUrl = (url: string | null) => {
    console.log('Raw image URL:', url);
    const processedUrl = getEntityImageUrl(url, 'events');
    console.log('Processed image URL:', processedUrl);
    return processedUrl;
  };
  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
    setSelectedDelegation(null); // Réinitialisez la délégation sélectionnée
    setAvailableDelegations(region ? delegations[region as keyof typeof delegations] || [] : []);
    setRegionModalVisible(false); // Fermez le modal de région
  };
  
  const handleDelegationSelect = (delegation: string | null) => {
    setSelectedDelegation(delegation);
    setDelegationModalVisible(false); // Fermez le modal de délégation
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#D7A738' }}>Événements</Text>
        <Text style={{ fontSize: 14, color: '#D7A738' }}>Découvrez les derniers événements</Text>
       <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <View style={styles.searchBarContainer}>
  <View style={styles.searchBar}>
    <Image source={require('../assets/search.png')} style={styles.searchIcon} />
    <TextInput
      placeholder="Rechercher un événement..."
      placeholderTextColor="#888"
      value={filter}
      onChangeText={setFilter}
      style={styles.input}
    />
    <TouchableOpacity style={styles.searchButton} onPress={() => console.log('Recherche:', filter)}>
      <Text style={styles.searchButtonText}>Rechercher</Text>
    </TouchableOpacity>
  </View>
</View>
  {/* Bouton pour sélectionner une région */}
<TouchableOpacity style={styles.regionButton} onPress={() => setRegionModalVisible(true)}>
  <Text style={styles.regionButtonText}>
    {selectedRegion ? `Région: ${selectedRegion}` : 'Sélectionner une région'}
  </Text>
  <Image source={require('../assets/filter.png')} style={styles.regionIcon} />
</TouchableOpacity>

{/* Modal pour la sélection des régions */}
<Modal visible={regionModalVisible} transparent={true} animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Sélectionnez une région</Text>
      <TouchableOpacity onPress={() => handleRegionSelect(null)}>
        <Text style={styles.regionOption}>Toutes les régions</Text>
      </TouchableOpacity>
      {regions.map((region) => (
        <TouchableOpacity key={region} onPress={() => handleRegionSelect(region)}>
          <Text style={styles.regionOption}>{region}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => setRegionModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Barre pour sélectionner une délégation */}
{selectedRegion && (
  <TouchableOpacity style={styles.regionButton} onPress={() => setDelegationModalVisible(true)}>
    <Text style={styles.regionButtonText}>
      {selectedDelegation ? `Délégation: ${selectedDelegation}` : 'Sélectionner une délégation'}
    </Text>
    <Image source={require('../assets/filter.png')} style={styles.regionIcon} />
  </TouchableOpacity>
)}

{/* Modal pour la sélection des délégations */}
<Modal visible={delegationModalVisible} transparent={true} animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Sélectionnez une délégation</Text>
      <TouchableOpacity onPress={() => handleDelegationSelect(null)}>
        <Text style={styles.regionOption}>Toutes les délégations</Text>
      </TouchableOpacity>
      {availableDelegations.map((delegation) => (
        <TouchableOpacity key={delegation} onPress={() => handleDelegationSelect(delegation)}>
          <Text style={styles.regionOption}>{delegation}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => setDelegationModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
            
      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.categoriesScrollContainer}
>
<TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.categoryButtonSelected,
          ]}
          onPress={() => handleCategorySelect(null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.categoryTextSelected,
            ]}
          >
            Toutes
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonSelected,
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.nomCat}
            </Text>
          </TouchableOpacity>     ))}
  {regions.map((region) => (
    <TouchableOpacity
      key={region}
      style={[
        styles.categoryButton,
        selectedRegion === region && styles.categoryButtonSelected
      ]}
      onPress={() => setSelectedRegion(region)}
    >
      <Text style={[
        styles.categoryText,
        selectedRegion === region && styles.categoryTextSelected
      ]}>{region}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>
   

      {filteredEvents.length === 0 ? (
        <Text style={styles.noEvents}>Aucun événement trouvé</Text>
      ) : (
        <View style={styles.gridContainer}>
          {filteredEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.card}
              onPress={() => handleEventPress(event)}
            >
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
              <Image
                source={
                  event.images && event.images.length > 0 && event.images[0]?.url
                    ? {
                      uri: debugImageUrl(event.images[0].url),
                      headers: { Accept: '*/*' }
                    }
                    : require('../assets/placeholder.png')
                }
                style={styles.cardImage}
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                onLoad={() => console.log('Image loaded successfully')}
              />
              
              <TouchableOpacity
                style={styles.favoreIconContainer}
                onPress={() => handleFavorePress(event)}
              >
                <Image
                  source={require('../assets/favores.png')}
                  style={[
                    styles.favoreIcon,
                    favoredEvents[event.id] && styles.favoreIconActive
                  ]}
                />
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{event.nomEvent}</Text>
              <Text style={styles.cardLocation}>{event.lieuEvent}, {event.regionEvent}</Text>
              <Text style={styles.cardDate}>
                Du {new Date(event.date_debutEvent).toLocaleDateString()}
              </Text>
              <Text style={styles.cardDate}>
                Au {new Date(event.date_finEvent).toLocaleDateString()}
              </Text>
              <Text numberOfLines={2} style={styles.cardDescription}>
                {event.descriptionEvent}
              </Text>

              <TouchableOpacity onPress={() => toggleComments(event.id)} style={styles.commentIconContainer}>
                <Image source={require('../assets/chat.png')} style={styles.commentIcon} />
              </TouchableOpacity>

              {expandedComments[event.id] && (
                <CommentSection elementId={event.id} elementType="evenements" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logo: {
    width:150, height:35,
    left:200,top:-50,
    resizeMode: 'contain',
  },
  searchBarContainer: {
    marginTop: -30,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    borderColor: '#4A7C87',
    borderWidth: 2,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#4A7C87',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8EB6AD',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  regionButtonText: {
    fontSize: 16,
    color: '#4A7C87',
    fontWeight: 'bold',
  },
  regionIcon: {
    width: 20,
    height: 20,
    tintColor: '#4A7C87',
  },
  delegationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
  },
  categoriesScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#8EB6AD',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryButtonSelected: {
    backgroundColor: '#8EB6AD',
    borderColor: '#4A7C87',
  },
  categoryText: {
    fontSize: 14,
    color: '#4A7C87',
    fontWeight: 'bold',
  },
  categoryTextSelected: {
    color: '#FFF',
  },
  companyContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
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

  modalContainer: { flex: 1, justifyContent: 'center',  backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, width: 300 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  regionOption: { fontSize: 16, marginVertical: 5, color: '#4A7C87' },
  closeButton: { marginTop: 10, padding: 10, backgroundColor: '#D7A738', borderRadius: 5 },
  closeButtonText: { color: '#FFF', fontWeight: 'bold' },

  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  commentIconContainer: {
    marginTop: 8,
  },
  commentIcon: {
    width: 24,
    height: 24,
  },

  containerTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 25,
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

  gridContainer: {
    flexDirection: 'column', // Chaque carte sur une nouvelle ligne
 
  },
  card: {
    width: '100%',           // La carte prend toute la largeur disponible
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noEvents: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },

});

export default EventComponent;