import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {getAllActivities} from '../services/activityService';
import {getEntityImageUrl} from '../services/imageService';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { SearchBar } from 'react-native-screens';

type RootStackParamList = {
  PostList: undefined;
  ActivityDetailScreen: {activityId: number};
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface Activite {
  idActP: string | number;
  nomActP: string;
  descriptionP: string;
  lieuP: string;
  regionP: string;
  prixP: number;
  offreP: string;
  images?: Array<{url: string}>;
}

const FlashSale = () => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [filteredActivites, setFilteredActivites] = useState<Activite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [offers, setOffers] = useState<string[]>([]);
  const [selectedOffer, setSelectedOffer] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [regions] = useState([
    'Ariana',
    'Béja',
    'Ben Arous',
    'Bizerte',
    'Gabès',
    'Gafsa',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Kébili',
    'Le Kef',
    'Mahdia',
    'Manouba',
    'Médenine',
    'Monastir',
    'Nabeul',
    'Sfax',
    'Sidi Bouzid',
    'Siliana',
    'Sousse',
    'Tataouine',
    'Tozeur',
    'Tunis',
    'Zaghouan',
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchActivites = async () => {
      try {
        const data = await getAllActivities();
        const filteredData = data.filter(
          (activity: Activite) => activity.offreP !== null,
        );
        setActivites(filteredData);
        setFilteredActivites(filteredData);

        // Extraire les offres uniques et les formater en %
        const uniqueOffers: string[] = Array.from(
          new Set(
            filteredData.map((activity: Activite) => `${activity.offreP}%`),
          ),
        );
        setOffers(uniqueOffers);
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
        Alert.alert('Erreur', 'Impossible de récupérer les activités.');
      }
    };

    fetchActivites();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterActivities(query, selectedOffer, selectedRegion);
  };

  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
    setModalVisible(false);
    filterActivities(searchQuery, selectedOffer, region);
  };

  const handleFilter = (offer: string) => {
    const normalizedOffer = offer === 'All' ? '' : offer; // "All" désélectionne le filtre
    setSelectedOffer(normalizedOffer);
    filterActivities(searchQuery, normalizedOffer, selectedRegion);
  };

  const filterActivities = (
    query: string,
    offer: string,
    region: string | null,
  ) => {
    let filteredData = activites;

    if (query) {
      filteredData = filteredData.filter(activity =>
        activity.nomActP.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (region) {
      filteredData = filteredData.filter(
        activity => activity.regionP === region,
      );
    }

    if (offer) {
      filteredData = filteredData.filter(
        activity => `${activity.offreP}%` === offer,
      );
    }

    setFilteredActivites(filteredData);
  };
  const handleActivityPress = (activity: Activite) => {
    navigation.navigate('ActivityDetailScreen', {
      activityId: Number(activity.idActP),
    });
  };
  const renderItem = ({item}: {item: Activite}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleActivityPress(item)}>
      <Image
        source={
          item.images && item.images.length > 0 && item.images[0]?.url
            ? {uri: getEntityImageUrl(item.images[0].url, 'activities')}
            : require('../assets/placeholder.png')
        }
        style={styles.cardImage}
        resizeMode="cover"
      />
      {item.offreP && (
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>{item.offreP}%</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nomActP}</Text>
        <Text style={styles.cardLocation}>
          📍 {item.lieuP}, {item.regionP}
        </Text>
        <Text style={styles.cardPrice}>💰 {item.prixP} TND</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#D7A738' }}>Offres</Text>
            <Text style={{ fontSize: 14, color: '#D7A738' }}>Offre spéciale juste pour notre participant</Text>
              <Image source={require('../assets/logo.png')} style={styles.logo} />
          </View>
      {/* Barre de recherche */}
      <View style={styles.searchBarContainer}>
      <View style={styles.searchBar}>
        <Image source={require('../assets/search.png')} style={styles.searchIcon}/>
    <TextInput
  placeholder="Rechercher une activité..."
  placeholderTextColor="#888"
  value={searchQuery}
  onChangeText={(text) => {
    setSearchQuery(text);
    filterActivities(text, selectedOffer, selectedRegion);
  }}
  style={styles.input}
/>
      <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchQuery)}>
      <Text style={styles.searchButtonText}>Rechercher</Text>
      </TouchableOpacity>
        </View>
      </View>
     
      {/* Bouton pour sélectionner une région */}
      <TouchableOpacity
        style={styles.regionButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.regionButtonText}>
          {selectedRegion
            ? `Région: ${selectedRegion}`
            : 'Sélectionner une région'}
        </Text>
        <Image
          source={require('../assets/filter.png')}
          style={styles.regionIcon}
        />
      </TouchableOpacity>
      {/* Filtres pour les offres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !selectedOffer && styles.filterButtonSelected,
          ]}
          onPress={() => handleFilter('All')}>
          <Text
            style={[
              styles.filterButtonText,
              !selectedOffer && styles.filterButtonTextSelected,
            ]}>
            Toutes
          </Text>
        </TouchableOpacity>
        {offers.map(offer => (
          <TouchableOpacity
            key={offer}
            style={[
              styles.filterButton,
              selectedOffer === offer && styles.filterButtonSelected,
            ]}
            onPress={() => handleFilter(offer)}>
            <Text
              style={[
                styles.filterButtonText,
                selectedOffer === offer && styles.filterButtonTextSelected,
              ]}>
              {offer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste des activités */}
      <FlatList
        data={filteredActivites}
        renderItem={renderItem}
        keyExtractor={item => item.idActP.toString()}
      />

      {/* Modal pour la sélection des régions */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez une région</Text>
            <TouchableOpacity onPress={() => handleRegionSelect(null)}>
              <Text style={styles.regionOption}>Toutes les régions</Text>
            </TouchableOpacity>
            {regions.map(region => (
              <TouchableOpacity
                key={region}
                onPress={() => handleRegionSelect(region)}>
                <Text style={styles.regionOption}>{region}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={{height: 90}}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
marginTop: -40,
marginBottom:20
  },  logo: {
    width:130, height:35,
    left:200,top:-50,
    resizeMode: 'contain',
  },
  searchBar: {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#FFF',
    borderRadius:25,
    borderColor:'#4A7C87',
    borderWidth:2,
    overflow:'hidden',
  },
  input:{
    flex:1,
    paddingVertical:10,
    paddingHorizontal:15,
    fontSize:16
  },
  searchIcon:{
    width:20,
    height:20,
    marginLeft:10,
    marginRight:10
  },
  searchButton:{
    backgroundColor:'#4A7C87',
    paddingVertical:10,
    paddingHorizontal:15,
    borderTopRightRadius:25,
    borderBottomRightRadius:25,
    justifyContent:'center',
    alignItems : 'center',
  },
  searchButtonText:{
    color:'#fff'
  },
  filterButtonText: {
    color: '#8EB6AD', // Couleur par défaut
    fontWeight: 'bold',
  },
  filterButtonTextSelected: {
    color: '#FFF', // Couleur blanche pour le texte sélectionné
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  decorImage: {
    position: 'absolute',
    width: 320,
    height: 330,
  },
  topLeft: {
    top: -20,
    left: -110,
  },
  topLeftLower: {
    top: -100,
    left: -100,
  },
  bottomRight: {
    bottom: -120,
    right: -110,
  },
  searchInput: {
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  regionButtonText: {
    fontSize: 16,
    color: '#666',
  },
  regionIcon: {
    width: 20,
    height: 20,
    tintColor: '#4A7C87',
  },
  card: {
    width: '100%',
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
    height: 150,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  cardContent: {
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  offerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  offerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  regionOption: {
    fontSize: 16,
    marginVertical: 5,
    color: '#4A7C87',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#D7A738',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
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
    backgroundColor: '#FFF',
  },
  filterButtonSelected: {
    backgroundColor: '#8EB6AD',
  },
});

export default FlashSale;
