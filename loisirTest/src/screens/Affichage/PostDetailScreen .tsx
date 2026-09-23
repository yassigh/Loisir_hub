import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getAllPostes, getPostById } from '../services/postService';
import { getFavores, createFavore, suppFavore } from '../services/FavoreService'; // Import the getFavores and createFavore services
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import CommentSection from './CommentSection';
import { getEntityImageUrl } from '../services/imageService';
import { Dimensions } from 'react-native';
import { getEntityImageUrlq } from '../services/imageService';
import { getAllEntreprises } from '../services/authService'; // Importez le service pour récupérer les entreprises

type RootStackParamList = {
  PostList: undefined;
  PostDetail: { postId: number };
};

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

interface Post {
  id: number;
  nomPoste: string;
  descriptionPoste: string;
 
  images?: Array<{ url: string }>;
  categorie: {
    nomCat: string;
  };
  datePoste: string;
  entreprise_id: number; // Added entreprise_id property
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
const PostDetailScreen = () => {
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favored, setFavored] = useState(false);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const [entreprises, setEntreprises] = useState<{ [key: number]: { nomE: string; logoE: string | null } }>({});
    const [favoredPostes, setFavoredPostes] = useState<{ [key: number]: boolean }>({});
      
  
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
  
        // Récupérez les détails du poste
        const postData = await getPostById(postId);
  
        // Vérifiez si les informations de l'entreprise sont incluses
        if (!postData.entreprise) {
          const entreprisesData = await getAllEntreprises();
          const entreprise = entreprisesData.find((e: { id: number }) => e.id === parseInt(postData.entreprise_id));
          postData.entreprise = entreprise || { nomE: 'Entreprise inconnue', logoE: null };
        }
  
        setPost(postData);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du poste:', error);
        setError('Impossible de charger les détails du poste');
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
    
        const isFavored = favoresData.some(
          (favore: Favore) => Number(favore.entity_id) === postId && favore.entity_type === 'postes'
        );
    
        console.log(`Post ${postId} est favori:`, isFavored);
    
        setFavored(isFavored);
      } catch (error) {
        console.error('Erreur lors de la récupération des favores:', error);
      }
    }; fetchFavores();
    fetchPostDetails();
  }, [postId]);
  
 const handleFavorePress = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) throw new Error('User ID not found');

    const favoresData = await getFavores(userId);
    const favore = favoresData.find(
      (favore: any) =>
        Number(favore.entity_id) === postId && favore.entity_type === 'postes'
    );

    if (favored && favore) {
      // Déjà favori, donc on supprime
      await suppFavore(favore.id);
      setFavored(false);
      Alert.alert('Succès', 'Post supprimé des favoris');
    } else if (!favored) {
      // Pas encore favori, donc on ajoute
      const favoreData = {
        user_id: userId,
        entity_id: postId,
        entity_type: 'postes',
        event_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      await createFavore(favoreData);
      setFavored(true);
      Alert.alert('Succès', 'Post ajouté aux favoris');
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    Alert.alert('Erreur', 'Impossible de gérer les favoris');
  }
};

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text>{error || 'Post non trouvé'}</Text>
      </View>
    );
  }
  const debugImageUrl = (url: string | null) => {
    console.log('Raw image URL:', url);
    const processedUrl = getEntityImageUrl(url, 'posts');
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
    {post.images && post.images.length > 0 ? (
      post.images.map((image, index) => (
        <View key={index} style={[styles.imageSlide, { width: screenWidth }]}>
          <Image
            source={{
              uri: debugImageUrl(image.url),
              headers: { Accept: '*/*' }
            }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      ))
    ) : (
      <View style={[styles.imageSlide, { width: screenWidth }]}>
        <Image
          source={require('../assets/placeholder.png')}
          style={styles.postImage}
          resizeMode="cover"
        />
      </View>
    )}
  </ScrollView>

  {/* Image Indicators */}
  {post.images && post.images.length > 1 && (
    <View style={styles.pagination}>
      {post.images.map((_, index) => (
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
        <TouchableOpacity onPress={() => toggleComments(post.id)} style={styles.commentIconContainer}>
          <Image source={require('../assets/chat.png')} style={styles.commentIcon} />
        </TouchableOpacity>
        {expandedComments[post.id] && (
          <CommentSection elementId={post.id} elementType="postes" />
        )}
         {/* Logo et nom de l'entreprise */}
         <View style={styles.companyContainer}>
  {post.entreprise && post.entreprise.logoE ? (
    <Image
      source={{ uri: `http://192.168.154.17:8001/storage/${post.entreprise.logoE}` }}
      style={styles.companyLogo}
    />
  ) : (
    <Image source={require('../assets/placeholder.png')} style={styles.companyLogo} />
  )}
  <Text style={styles.companyName}>
    {post.entreprise ? post.entreprise.nomE : 'Entreprise inconnue'}
  </Text>
</View>
        
        <Text style={styles.title}>{post.nomPoste}</Text>

      

        

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{post.descriptionPoste}</Text>
        </View>

        <View style={styles.categoryContainer}>
  <Text style={styles.categoryTitle}>Catégorie</Text>
  <Text style={styles.category}>
    {post.categorie ? post.categorie.nomCat : 'Catégorie inconnue'}
  </Text>
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
    backgroundColor: '#F8F8F8',
  },
  commentIconContainer: {
    marginTop: 8,
  },
  commentIcon: {
    width: 24,
    height: 24,
  },
  commentsContainer: {
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  postImage: {
    width: '100%',
    height: '100%',
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
  dateContainer: {
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#8EB6AD',
    marginBottom: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#000',
  },
  address: {
    fontSize: 14,
    color: '#8EB6AD',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7A738',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#8EB6AD',
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

export default PostDetailScreen;