import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from 'react-native';
import { getAllPostes } from '../services/postService';
import { getCategories } from '../services/categoriesService';
import { getFavores, createFavore, suppFavore } from '../services/FavoreService'; // Import the getFavores and createFavore services
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CommentSection from './CommentSection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntityImageUrl } from '../services/imageService';
import { getEntityImageUrlq } from '../services/imageService';
import delegations from './delegations';
import { getAllEntreprises } from '../services/authService';
type RootStackParamList = {
  PostList: undefined;
  PostDetailScreen: { postId: number };
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface Post {
  id: number;
  nomPoste: string;
  descriptionPoste: string;

  images?: Array<{ url: string }>;
  categorie: {
    nomCat: string;
  };
  entreprise: {
    nomE: string;
    logoE: string | null;
  }; entreprise_id: number; 
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

const PostComponent = () => {
  const [posts, setPosts] = useState<Post[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoredPosts, setFavoredPosts] = useState<{ [key: number]: boolean }>({});
  const navigation = useNavigation<NavigationProps>();
   const [modalVisible, setModalVisible] = useState(false);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null);
  const [availableDelegations, setAvailableDelegations] = useState<string[]>([]);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [delegationModalVisible, setDelegationModalVisible] = useState(false);
  const regions = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filter ? post.nomPoste.toLowerCase().includes(filter.toLowerCase()) : true;
    const matchesCategory = selectedCategory
      ? post.categorie && post.categorie.nomCat === categories.find((cat) => cat.id === selectedCategory)?.nomCat
      : true;
    
    return matchesFilter && matchesCategory;
  });
  
  console.log('Filtered posts:', filteredPosts); // Debug les postes filtrés
  useEffect(() => {
    const fetchPostsAndEntreprises = async () => {
      try {
        setLoading(true);
  
        // Récupérez les postes et les entreprises
        const [rawPostsData, entreprisesData] = await Promise.all([
          getAllPostes(),
          getAllEntreprises(),
        ]);
  
        console.log('Raw posts data:', rawPostsData); // Debug les données brutes des postes
  
        // Convertir les données des postes en tableau
        const postsData: Post[] = Object.values(rawPostsData) as Post[];
        console.log('Converted posts data:', postsData); // Debug les données converties
  
        console.log('Entreprises data:', entreprisesData); // Debug les données des entreprises
  
        // Mappez les entreprises par leur ID
        const entreprisesMap = entreprisesData.reduce((map: { [key: number]: { nomE: string; logoE: string | null } }, entreprise: { id: number; nomE: string; logoE: string | null }) => {
          map[entreprise.id] = { nomE: entreprise.nomE, logoE: entreprise.logoE };
          return map;
        }, {});
  
        // Ajoutez les informations des entreprises aux postes
        const postsWithEntreprises = postsData.map((post) => ({
          ...post,
          entreprise: entreprisesMap[post.entreprise_id] || { nomE: 'Entreprise inconnue', logoE: null },
        }));
  
        console.log('Posts with entreprises:', postsWithEntreprises); // Debug les postes avec entreprises
  
        setPosts(postsWithEntreprises);
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
          if (favore.entity_type === 'postes') {
            favoredActivitiesMap[favore.entity_id as number] = true;
          }
        });
        setFavoredPosts(favoredActivitiesMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des favores:', error);
      }
    };
    const fetchPostsAndCategories = async () => {
      try {
        setLoading(true);
  
        // Récupérez les postes et les catégories
        const [rawPostsData, categoriesData] = await Promise.all([
          getAllPostes(),
          getCategories(),
        ]);
  
        console.log('Raw posts data:', rawPostsData); // Debug les données brutes des postes
        console.log('Categories data:', categoriesData); // Debug les données des catégories
  
        // Convertir les données des postes en tableau
        const postsData: Post[] = Object.values(rawPostsData) as Post[];
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPostsAndCategories();
    fetchFavores();
    fetchPostsAndEntreprises();
  }, []);
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetailScreen', { postId: post.id });
  };

  const handleFavorePress = async (post: Post) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) throw new Error('User ID not found');

    if (favoredPosts[post.id]) {
      // Récupérer l'ID du favori à partir des données des favoris
      const favoresData = await getFavores(userId);
      const favore = favoresData.find(
        (favore: Favore) =>
          favore.entity_id === post.id && favore.entity_type === 'postes'
      );

      if (favore) {
        // Appeler la fonction de suppression avec l'ID du favori
        await suppFavore(favore.id);
        setFavoredPosts((prev) => {
          const updated = { ...prev };
          delete updated[post.id];
          return updated;
        });
        Alert.alert('Succès', 'Post supprimé des favoris');
      } else {
        Alert.alert('Erreur', 'Favori non trouvé.');
      }
    } else {
      // Ajouter aux favoris
      const favoreData = {
        user_id: userId,
        entity_id: post.id,
        entity_type: 'postes',
        event_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      await createFavore(favoreData);
      setFavoredPosts((prev) => ({
        ...prev,
        [post.id]: true,
      }));
      Alert.alert('Succès', 'Post ajouté aux favoris');
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    Alert.alert('Erreur', 'Impossible de gérer les favoris');
  }
};

  if (loading) {
    return <Text>Chargement des Publications...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }



  const debugImageUrl = (url: string | null) => {
    console.log('Raw image URL:', url);
    const processedUrl = getEntityImageUrl(url, 'posts');
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
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#D7A738' }}>Publications</Text>
        <Text style={{ fontSize: 14, color: '#D7A738' }}>Découvrez les derniers posts</Text>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <View style={styles.searchBarContainer}>
  <View style={styles.searchBar}>
    <Image source={require('../assets/search.png')} style={styles.searchIcon} />
    <TextInput
      placeholder="Rechercher une Publications."
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
    </TouchableOpacity>
  ))}
</ScrollView>

      {filteredPosts.length === 0 ? (
        <Text style={styles.noPosts}>Aucun post trouvé</Text>
      ) : (
        <View style={styles.gridContainer}>
          {filteredPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() => handlePostPress(post)}
            >
              {/* Logo et nom de l'entreprise */}
              <View style={styles.companyContainer}>
          {post.entreprise && post.entreprise.logoE ? (
            <Image
              source={{ uri: `http://192.168.100.122:8001/storage/${post.entreprise.logoE}` }}
              style={styles.companyLogo}
            />
          ) : (
            <Image source={require('../assets/placeholder.png')} style={styles.companyLogo} />
          )}
          <Text style={styles.companyName}>
            {post.entreprise ? post.entreprise.nomE : 'Entreprise inconnue'}
          </Text>
        </View>

           <Image
                     source={
                       post.images && post.images.length > 0 && post.images[0]?.url
                         ? {
                           uri: debugImageUrl(post.images[0].url),
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
                onPress={() => handleFavorePress(post)}
              >
                <Image
                  source={require('../assets/favores.png')}
                  style={[
                    styles.favoreIcon,
                    favoredPosts[post.id] && styles.favoreIconActive
                  ]}
                />
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{post.nomPoste}</Text>
               <Text numberOfLines={2} style={styles.cardDescription}>{post.descriptionPoste}</Text>
              <TouchableOpacity onPress={() => toggleComments(post.id)} style={styles.commentIconContainer}>
                <Image source={require('../assets/chat.png')} style={styles.commentIcon} />
              </TouchableOpacity>
              {expandedComments[post.id] && (
                <CommentSection elementId={post.id} elementType="postes" />
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
    width:150, height:45,
    left:190,top:-50,
    resizeMode: 'contain',
  },
  searchBarContainer: {
    marginTop: -40,
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
    fontSize: 14,
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
  gridContainer: {
    flexDirection: 'column',
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
    tintColor: '#8EB6AD',
  },
  favoreIconActive: {
    tintColor: 'red',
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
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noPosts: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  companyContainer: {
    flexDirection: 'row',

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
  
});

export default PostComponent;