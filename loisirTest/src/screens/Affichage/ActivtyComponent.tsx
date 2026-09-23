import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from 'react-native';
import { getAllActivities } from '../services/activityService';
import { getCategories } from '../services/categoriesService';
import { getFavores, createFavore, deleteFavore, suppFavore } from '../services/FavoreService';
import CommentSection from './CommentSection';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getEntityImageUrl } from '../services/imageService';
import { getEntityImageUrlq } from '../services/imageService';
import delegations from './delegations'; // Importez le fichier des délégations
import { getAllEntreprises } from '../services/authService';

type RootStackParamList = {
  ActivityList: undefined;
  ActivityDetailScreen: { activityId: number };
  profileEntrpriseVisite: { entrepriseId: number };
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
  entreprise_id: number;
  entrepriseName?: string;
  entrepriseLogo?: string;
}

interface Category {
  id: number;
  nomCat: string;
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

const ActivityComponent = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [favoredActivities, setFavoredActivities] = useState<{ [key: number]: boolean }>({});
 const [modalVisible, setModalVisible] = useState(false);
 const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null); // Nouvel état pour la délégation
 const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
 const [availableDelegations, setAvailableDelegations] = useState<string[]>([]);
 const [entreprises, setEntreprises] = useState<{ [key: number]: { nomE: string; logoE: string } }>({});
 const [regionModalVisible, setRegionModalVisible] = useState(false); // État pour le modal de région
 const [delegationModalVisible, setDelegationModalVisible] = useState(false); // État pour le modal de délégation
  const navigation = useNavigation<NavigationProps>();
  // const favoreId = activity.idActP; // Removed as 'activity' is undefined

  
  const regions = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

 

  useEffect(() => {
    const fetchActivitiesAndEntreprises = async () => {
      try {
        setLoading(true);
  
        // Récupérez les activités et les entreprises en parallèle
        const [activitiesData, entreprisesData, categoriesData] = await Promise.all([
          getAllActivities(),
          getAllEntreprises(),
          getCategories(),
        ]);
  
        console.log('Activities data:', activitiesData); // Debug
        console.log('Entreprises data:', entreprisesData); // Debug
        console.log('Categories data:', categoriesData); // Debug
  
        if (!Array.isArray(activitiesData)) {
          throw new Error('Les activités ne sont pas dans un format valide.');
        }
  
        if (!Array.isArray(categoriesData)) {
          throw new Error('Les catégories ne sont pas dans un format valide.');
        }
  
        // Mappez les entreprises par leur ID
        const entreprisesMap = entreprisesData.reduce((map: { [key: number]: { nomE: string; logoE: string } }, entreprise: { id: number; nomE: string; logoE: string }) => {
          map[entreprise.id] = { nomE: entreprise.nomE, logoE: entreprise.logoE };
          return map;
        }, {});
  
        // Ajoutez les informations des entreprises aux activités
        const activitiesWithEntreprises = activitiesData.map((activity) => ({
          ...activity,
          entrepriseName: entreprisesMap[activity.entreprise_id]?.nomE || 'Entreprise inconnue',
          entrepriseLogo: entreprisesMap[activity.entreprise_id]?.logoE || null,
        }));
  
        setActivities(activitiesWithEntreprises);
        setCategories(categoriesData);
        setEntreprises(entreprisesMap);
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
        if (!userId) throw new Error('User ID not found');
  
        const favoresData = await getFavores(userId);
        console.log('Favores récupérés:', favoresData);
  
        const favoredActivitiesMap: { [key: number]: boolean } = {};
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
  
    fetchFavores();
    fetchActivitiesAndEntreprises();
  }, []);

  const toggleComments = (activityId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleActivityPress = (activity: Activity) => {
    navigation.navigate('ActivityDetailScreen', { activityId: activity.idActP });
  };

  const handleFavorePress = async (activity: Activity) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');
  
      if (favoredActivities[activity.idActP]) {
        // Supprimer des favoris
        console.log('Suppression du favori avec ID :', activity.idActP);
  
        // Récupérer l'ID du favori à partir des données des favoris
        const favoresData = await getFavores(userId); // Récupérer les favoris depuis le backend
        const favore = favoresData.find(
          (favore: Favore) =>
            favore.entity_id === activity.idActP && favore.entity_type === 'activite_payants'
        );
  
        if (favore) {
          console.log('Mapped favoreId:', favore.id);
  
          // Appeler la fonction suppFavore avec l'ID correct
          const response = await suppFavore(favore.id);
  
          if (response) {
            // Mettre à jour l'état local pour refléter la suppression
            setFavoredActivities((prev) => {
              const updated = { ...prev };
              delete updated[activity.idActP];
              return updated;
            });
  
            Alert.alert('Succès', 'Activité supprimée des favoris');
          } else {
            console.error('La suppression du favori a échoué côté backend.');
            Alert.alert('Erreur', 'Impossible de supprimer le favori.');
          }
        } else {
          console.error('Favori non trouvé dans la liste des favoris.');
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
        console.log('Ajout du favori :', favoreData);
  
        const response = await createFavore(favoreData);
  
        if (response) {
          // Mettre à jour l'état local pour refléter l'ajout
          setFavoredActivities((prev) => ({
            ...prev,
            [activity.idActP]: true,
          }));
  
          Alert.alert('Succès', 'Activité ajoutée aux favoris');
        } else {
          console.error('L\'ajout du favori a échoué côté backend.');
          Alert.alert('Erreur', 'Impossible d\'ajouter le favori.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      Alert.alert('Erreur', 'Impossible de gérer les favoris');
    }
  };
  if (loading) {
    return <Text>Chargement des activités...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  const filteredActivities = Array.isArray(activities)
  ? activities.filter(activity => {
    const matchesFilter = filter ? activity.nomActP.toLowerCase().includes(filter.toLowerCase()) : true;
    const matchesCategory = selectedCategory ? activity.categorie.nomCat === categories.find(cat => cat.id === selectedCategory)?.nomCat : true;
    const matchesRegion = selectedRegion ? activity.regionP === selectedRegion : true;
    const matchesDelegation = selectedDelegation ? activity.lieuP === selectedDelegation : true;
    return matchesFilter && matchesCategory && matchesRegion && matchesDelegation;
 
  })
  : [];
  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
    setSelectedDelegation(null); // Réinitialisez la délégation sélectionnée
    setAvailableDelegations(region ? delegations[region as keyof typeof delegations] || [] : []);
    setRegionModalVisible(false); // Fermez uniquement le modal de région
  };
  
  const handleDelegationSelect = (delegation: string | null) => {
    setSelectedDelegation(delegation);
    setDelegationModalVisible(false); // Fermez uniquement le modal de délégation
  };
  const debugImageUrl = (url: string | null) => {
    console.log('Raw image URL:', url);
    const processedUrl = getEntityImageUrl(url, 'activities');
    console.log('Processed image URL:', processedUrl);
    return processedUrl;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>    
    
    <Image source={require('../assets/background_yellow.png')} style={[styles.decorImage, styles.topLeftLower]} />
    <Image source={require('../assets/background.png')} style={[styles.decorImage, styles.topLeft]} />
    <View style={styles.headerContainer}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.headerTitle}>Activités</Text>
      <Text style={styles.headerTitle}>Découvrez les dernières activités</Text>
    </View>
  
    <View style={styles.searchBarContainer}>
  <View style={styles.searchBar}>
    <Image source={require('../assets/search.png')} style={styles.searchIcon} />
    <TextInput
      placeholder="Rechercher une activité..."
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
    {/* Catégories */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesScrollContainer}
    >
      <TouchableOpacity
        key="all"
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
        </TouchableOpacity>
      ))}
    </ScrollView>
  
    {/* Liste des activités */}
    {filteredActivities.map((activity) => (
       <TouchableOpacity
       key={activity.idActP}
       onPress={() => handleActivityPress(activity)}
       style={styles.card}
     >
      <View style={styles.companyContainer}>
  <TouchableOpacity
    style={{ flexDirection: 'row', alignItems: 'center' }}
    onPress={() => navigation.navigate('profileEntrpriseVisite', { entrepriseId: activity.entreprise_id })}
  >
    {activity.entrepriseLogo ? (
      <Image
        source={{ uri: `http://192.168.100.122:8001/storage/${activity.entrepriseLogo}` }}
        style={styles.companyLogo}
      />
    ) : (
      <Image source={require('../assets/placeholder.png')} style={styles.companyLogo} />
    )}
    <Text style={styles.companyName}>{activity.entrepriseName}</Text>
  </TouchableOpacity>
</View>
  
        {/* Afficher la première image ou un placeholder */}
        <Image
          source={
            activity.images && activity.images.length > 0 && activity.images[0]?.url
              ? { uri: debugImageUrl(activity.images[0].url) }
              : require('../assets/placeholder.png')
          }
          style={styles.cardImage}
        />
  
        <TouchableOpacity
          style={styles.favoreIconContainer}
          onPress={() => handleFavorePress(activity)}
        >
          <Image
            source={require('../assets/favores.png')}
            style={[
              styles.favoreIcon,
              favoredActivities[activity.idActP] && styles.favoreIconActive,
            ]}
          />
        </TouchableOpacity>
  
        <Text style={styles.cardTitle}>{activity.nomActP}</Text>
        <Text style={styles.cardLocation}>
          {activity.lieuP}, {activity.regionP}
        </Text>
        <Text style={styles.cardPrice}>{activity.prixP} DT</Text>
        {activity.offreP && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>-{activity.offreP}%</Text>
          </View>
        )}
        <Text numberOfLines={2} style={styles.cardDescription}>
          {activity.descriptionP}
        </Text>
        <TouchableOpacity
          onPress={() => toggleComments(activity.idActP)}
          style={styles.commentIconContainer}
        >
          <Image source={require('../assets/chat.png')} style={styles.commentIcon} />
        </TouchableOpacity>
        {expandedComments[activity.idActP] && (
          <CommentSection elementId={activity.idActP} elementType="activite_payants" />
        )}
       </TouchableOpacity>
    ))}
  </ScrollView>
  );}

const styles = StyleSheet.create({
  searchBarContainer: {
    marginTop: 20,
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
  searchContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
   
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D7A738',
    marginTop: 0,
   
  textAlign: 'left'
  },
  logo: {
    width:170, height:45,
    left:220,
    resizeMode: 'contain',
  },
  companyContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginTop: 8,
  },
  delegationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
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
  regionIcon: { width: 20, height: 20, tintColor: '#4A7C87' },
 
  modalContainer: { flex: 1, justifyContent: 'center',  backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, width: 300,  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  regionOption: { fontSize: 16, marginVertical: 5, color: '#4A7C87' },
  closeButton: { marginTop: 10, padding: 10, backgroundColor: '#D7A738', borderRadius: 5 },
  closeButtonText: { color: '#FFF', fontWeight: 'bold' },
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
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#4A7C87',
    fontWeight: 'bold',
  },
  categoryTextSelected: {
    color: '#fff',
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
  commentIconContainer: {
    marginTop: 8,
  },
  commentIcon: {
    width: 24,
    height: 24,
  },
  decorImage: {
    position: 'absolute',
    width: 390,
    height: 290,
  },
  topLeft: {
    top: -10,
    left: -110,
  },
  topLeftLower: {
    top: -100,
    left: -100,
  },

  gridContainer: {
    flexDirection: 'column', // Chaque carte sur une nouvelle ligne
    // alignItems: 'center',    // Centrer les cartes horizontalement
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
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  offerBadge: {
    position: 'absolute',
    top: 33,
    left: 288,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 4,
  },
  offerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noActivities: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
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
});

export default ActivityComponent;