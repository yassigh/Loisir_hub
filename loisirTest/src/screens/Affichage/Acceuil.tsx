import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, ScrollView
} from "react-native";
import { getCategories } from "../services/categoriesService";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import { getAllEvent } from "../services/EventService";
import { getAllActivities } from "../services/activityService";
import { getEntityImageUrl, getLoisirImageUrl } from "../services/imageService";
import { getPubliciteImages } from '../services/publiciteService';
import { generateImageUrl } from '../services/imageService';
import { getAllPostes } from "../services/postService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from "../services/Api";
// Types et Interfaces
type RootStackParamList = {
 
  ActivityComponent: undefined;
  ActivityDetailScreen: { activityId: number };
  postComponent: undefined;
  eventComponent: undefined;
  FlashSale: undefined;
  JustForYou: { userId: number };
  EventDetailScreen: { eventId: number };
  CategoryFilter: { categoryId: number, categoryName: string };
  PostDetailScreen: { postId: number };
   NotificationScreen: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface CategoryWithImages extends Category {
  activities?: Array<{
    idActP: number;
    nomActP: string;
    images?: Array<{ url: string }>;
  }>;
}

// Modifiez l'interface PubliciteImage
interface PubliciteImage {
  id: number;
  images: Array<{ url: string }>;
  date_debut: string;
  jours: number;
}

interface RandomImages {
  categoryId: number;
  images: string[];
}

interface Category {
  id: number;
  nomCat: string;
  activites_payantes_count: number;
  images: string[] | null;
}

interface Event {
  id: number;
  nomEvent: string;
  lieuEvent: string;
  date_debutEvent: string;
  images?: Array<{ url: string }>;
}

interface Activity {
  idActP: string | number;
  nomActP: string;
  descriptionP: string;
  lieuP: string;
  regionP: string;
  prixP: number;
  offreP: string;
  categorie_id: string | number;
  images?: Array<{ url: string }>;
}

interface Post {
  id: number;
  nomPoste: string;
  descriptionPoste: string;
  lieuPoste: string;
  regionPoste: string;
  images?: Array<{ url: string }>;
}
interface Recommendation {
  id: number;
  nom: string;
  description: string;
  url?: string | null; 
  image_url?: string | null;
  type: 'evenement' | 'activite_payante' | 'poste';
}
const Acceuil = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [events, setEvents] = useState<Event[]>([]);
  const [flashSaleActivities, setFlashSaleActivities] = useState<Activity[]>([]);
  const [categoriesWithImages, setCategoriesWithImages] = useState<CategoryWithImages[]>([]);
  const [randomCategoryImages, setRandomCategoryImages] = useState<RandomImages[]>([]);
  const [postes, setPostes] = useState<Post[]>([]);
  const [publicites, setPublicites] = useState<PubliciteImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
   const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
const [activities, setActivities] = useState<Recommendation[]>([]);
  const [pythonPosts, setPythonPosts] = useState<Recommendation[]>([]);
  const generateImageUrl = (url: string | null): string | null => {
    if (!url) return null;
  
    // Si l'URL est déjà complète, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  
    // Construire l'URL complète
    return `http://192.168.100.122:8001/storage/${url.replace(/^\/+/, '')}`;
  };
  const generateImageUrlR = (url: string | null): string | null => {
    if (!url || typeof url !== 'string') {
      console.error('Chemin de l\'image invalide ou non défini :', url);
      return null; // Retourne null si le chemin est vide ou invalide
    }
  
    // Si l'URL est déjà complète, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Construire l'URL complète
    const BASE_URL = 'http://192.168.100.122:8000/storage';
    const fullUrl = `${BASE_URL}/${url.replace(/^\/+/, '')}`;
    console.log('URL générée pour l\'image :', fullUrl);
    return fullUrl;
  };
  // Ajoutez cette fonction d'aide
  const getRandomImages = (category: CategoryWithImages): string[] => {
    const images: string[] = [];
  
    if (category.activities) {
      const allImages = category.activities
        .filter(activity => activity.images && activity.images.length > 0)
        .flatMap(activity => activity.images!.map(img => getEntityImageUrl(img.url, 'activities')));
    const shuffledImages = allImages.sort(() => Math.random() - 0.5);
   images.push(...shuffledImages.slice(0, 4));
   while (images.length < 4) {
        images.push(''); 
      }
    } else { images.push('', '', '', '');
    }
  
    return images;
  };

  const navigateToJustForYou = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id'); // Récupérez l'ID utilisateur
      if (!userId) {
        console.error('User ID non trouvé');
        return;
      }
      navigation.navigate('JustForYou', { userId: Number(userId) }); // Passez l'ID utilisateur
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
    }
  };
  useEffect(() => {
     fetch('http://192.168.100.122:8000/api/activites-payantes')
    .then(res => res.json())
    .then(data => console.log('Test fetch direct:', data))
    .catch(err => console.error('Erreur fetch direct:', err));

    const fetchPublicites = async () => {
      try {
        const data = await getPubliciteImages();
       
        setPublicites(data);
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
      }
    };
const fetchCategories = async () => {
  try {
    const data = await getCategories();
    const activities = await getAllActivities(); 
  

    const categoriesData = data.map((category: Category) => {
      // Filtrer les activités pour cette catégorie
      const categoryActivities = activities.filter(
        (activity: Activity) => Number(activity.categorie_id) === category.id
      );
   
      return {
        ...category,
        activities: categoryActivities,
        activites_payantes_count: categoryActivities.length
      };
    });
 setCategoriesWithImages(categoriesData);
    
    // Générer les images aléatoires pour chaque catégorie
    const randomImages = categoriesData.map((category: CategoryWithImages) => ({
      categoryId: category.id,
      images: getRandomImages(category)
    }));
    
    setRandomCategoryImages(randomImages);
    setCategories(categoriesData); 
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
  } finally {
    setLoading(false);
  }
};
const fetchPostes = async () => {
  try {
    const rawPostsData = await getAllPostes();
    console.log('Raw posts data in Acceuil:', rawPostsData); // Debug les données brutes des postes

    // Convertir les données des postes en tableau
    const postsData: Post[] = Object.values(rawPostsData) as Post[];
    console.log('Converted posts data:', postsData); // Debug les données converties

    // Ajoutez les images transformées si nécessaire
    const postsWithImages = postsData.map((post) => ({
      ...post,
      images: post.images && post.images.length > 0
        ? post.images.map((img) => ({
            ...img,
            url: getEntityImageUrl(img.url, 'postes'), // Transformez l'URL
          }))
        : [],
    }));

    console.log('Posts with images:', postsWithImages); // Debug les postes avec images
    setPostes(postsWithImages);
  } catch (error) {
    console.error('Erreur lors du chargement des postes:', error);
    setPostes([]);
  }
};
    const fetchEvents = async () => {
      try {
        const eventsData = await getAllEvent();
        console.log('Events data received:', eventsData);
        if (Array.isArray(eventsData)) {
          console.log('Setting events with images:', eventsData);
          setEvents(eventsData);
        } else {
          console.log('No events data or invalid format');
          setEvents([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des événements :", error);
        setEvents([]);
      }
    };

    const fetchFlashSaleActivities = async () => {
      try {
        const allActivities = await getAllActivities();
        const filteredActivities = allActivities.filter(
          (activity: Activity) => activity.offreP && activity.offreP !== "0%"
        );
        setFlashSaleActivities(filteredActivities);
      } catch (error) {
        console.error("Erreur lors du chargement des activités en promotion :", error);
      }
    };
   const fetchRecommendations = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID non trouvé');
      return;
    }

    const response = await fetch(`http://192.168.100.122:5000/api/reco/just-for-you/${userId}`);
    if (!response.ok) {
      console.error('Erreur HTTP:', response.status, await response.text());
      return;
    }
    const text = await response.text();
    // Remplace les NaN par null pour éviter les erreurs de parsing
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);

    // Mapping uniforme
    setActivities(data.activite_payante || []);
    setRecommendations([
      ...(data.evenement || []).map((item: any) => ({ ...item, type: 'evenement' })),
      ...(data.poste || []).map((item: any) => ({ ...item, type: 'poste' })),
    ]);
    console.log('Recommendations formatées (Acceuil) :', data);
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations :', error);
  }
};
      const fetchUnreadNotificationsCount = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const response = await authApi.get('/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUnreadNotifications(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
    fetchUnreadNotificationsCount();
    fetchRecommendations();
    fetchPublicites();
    fetchPostes();
    fetchEvents();
    fetchCategories();
    fetchFlashSaleActivities();
  }, []);

  useEffect(() => {
    if (publicites.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === publicites.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);
  
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }  

  }, 
  [publicites]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  // Filtrer les données en fonction de la recherche
 
const filteredRecommendedActivities = activities.filter(activity =>
  activity.nom.toLowerCase().includes(searchQuery.toLowerCase())
);
const filteredRecommendedEvents = recommendations
  .filter(r => r.type === 'evenement')
  .filter(event => event.nom.toLowerCase().includes(searchQuery.toLowerCase()));
const filteredRecommendedPosts = recommendations
  .filter(r => r.type === 'poste')
  .filter(post => post.nom.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredCategories = categories.filter((category) =>
    category.nomCat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }
  // Removed duplicate declaration of getRandomImages
  
   
  const renderHeader = () => (
    <View>
      {/* Barre de recherche */}
      <View style={styles.header}>
         <Image source={require('../assets/logo.png')}style={{width:170, height:45, resizeMode: "contain", left: -30}}/>
         
        <Text style={styles.title}>Acceuil</Text>
       
          <View style={styles.header}>
       

        {/* <TextInput
          style={styles.input}
          placeholder="Rechercher..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        /> */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationScreen')}
          style={styles.notificationIcon}
        >
          <Image
            source={require('../assets/notification.png')}
            style={{ width: 70, height: 25, resizeMode: "contain" }}
          />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>

      </View>
    </View>
      <View style={styles.navigationContainer}>
  {/* Barre arrière-plan */}
  <View style={styles.horizontalScroll} />

  {/* Boutons de navigation */}
  <View style={styles.navigationButtons}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.navigationButtons}
  >
    <TouchableOpacity
      style={[styles.navButton, styles.shadow]}
      onPress={() => navigation.navigate('ActivityComponent')}
    >
      <Text style={styles.navButtonText}>Activités</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.navButton, styles.shadow]}
      onPress={() => navigation.navigate('eventComponent')}
    >
      <Text style={styles.navButtonText}>Événements</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.navButton, styles.shadow]}
      onPress={() => navigation.navigate('postComponent')}
    >
      <Text style={styles.navButtonText}>Postes</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.navButton, styles.shadow]}
      onPress={() => navigation.navigate('FlashSale')}
    >
      <Text style={styles.navButtonText}>offres</Text>
    </TouchableOpacity>
    <TouchableOpacity
  style={[styles.navButton, styles.shadow]}
  onPress={async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (userId) {
      navigation.navigate('JustForYou', { userId: Number(userId) });
    } else {
      console.error('User ID not found');
    }
  }} // Passez l'ID utilisateur
>
  <Text style={styles.navButtonText}>Recommandation personnalisée</Text>
</TouchableOpacity>
</ScrollView>
  </View>
  
</View>
      {/* Section publicité */}
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
        onError={(e) => {
          console.log('Erreur lors du chargement de l\'image de publicité:', e.nativeEvent.error);
        }}
        onLoad={() => console.log('Image de publicité chargée avec succès')}
      />
      <View style={styles.publiciteIndicators}>
        {publicites.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentImageIndex && styles.indicatorActive
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

   {/* Section offres */}
   <View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>offres</Text>
    <TouchableOpacity onPress={() => navigation.navigate('FlashSale')}>
      <Text style={styles.seeAll}>
        Tout voir{' '}
        <Image
          source={require('../assets/right-arrow.png')}
          style={{ width: 15, height: 15 }}
        />
      </Text>
    </TouchableOpacity>
  </View>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.horizontalScroll}
  >
    {flashSaleActivities.map((activity) => (
      <TouchableOpacity
        key={activity.idActP}
        style={styles.eventItem}
        onPress={() =>
          navigation.navigate('ActivityDetailScreen', {
            activityId: Number(activity.idActP),
          })
        }
      >
        {/* Conteneur principal de l'image */}
        <View style={styles.flashSaleImageContainer}>
          {/* Image principale */}
          <Image
            source={{
              uri: activity.images?.[0]?.url
                ? getEntityImageUrl(activity.images[0].url, 'activities')
                : 'https://via.placeholder.com/200x100',
            }}
            style={styles.flashSaleImage}
            resizeMode="cover"
          />
          {/* Superposition inclinée pour l'offre */}
          {activity.offreP && (
            <View style={styles.discountOverlay}>
              <Text style={styles.discountText}>{activity.offreP}%</Text>
            </View>
          )}
        </View>
        <Text style={styles.eventTitle}>{activity.nomActP}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>
      {/* En-tête des catégories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ActivityComponent')}>
        <Text style={styles.seeAll}>
          Tout voir <Image source={require('../assets/right-arrow.png')} style={{ width: 15, height: 15 }} />
        </Text>

        </TouchableOpacity>
      </View>
</View>
  );

  const renderFooter = () => (
    <View>
    <View style={styles.section}>
      {/* Section Nouveau Poste */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nouveau poste</Text>
        <TouchableOpacity onPress={() => navigation.navigate('postComponent')}>
          <Text style={styles.seeAll}>
            Tout voir <Image source={require('../assets/right-arrow.png')} style={{ width: 15, height: 15 }} />
          </Text>
        </TouchableOpacity>
      </View>
  
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {Array.isArray(postes) && postes.length > 0 ? (
          postes.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postItem}
              onPress={() => navigation.navigate('PostDetailScreen', { postId: post.id })}
            >
              <Image
                source={
                  post.images && post.images.length > 0 && post.images[0]?.url
                    ? { uri: post.images[0].url }
                    : require('../assets/placeholder.png') // Placeholder si aucune image
                }
                style={styles.postImage}
                resizeMode="cover"
              />
              <View style={styles.postContent}>
                <Text style={styles.postTitle} numberOfLines={2}>
                  {post.nomPoste}
                </Text>
                <Text style={styles.postLocation}>{post.lieuPoste}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>Aucun post disponible</Text>
          </View>
        )}
      </ScrollView>
      </View>
      {/* Section Nouvel Événement */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nouvel événement</Text>
          <TouchableOpacity onPress={() => navigation.navigate('eventComponent')}>
            <Text style={styles.seeAll}>
              Tout voir <Image source={require('../assets/right-arrow.png')} style={{ width: 15, height: 15 }} />
            </Text>
          </TouchableOpacity>
        </View>
  
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {Array.isArray(events) && events.length > 0 ? (
            events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => navigation.navigate('EventDetailScreen', { eventId: event.id })}
              >
                <Image
                  source={
                    event.images && event.images.length > 0 && event.images[0]?.url
                      ? { uri: getEntityImageUrl(event.images[0].url, 'evenements') }
                      : require('../assets/placeholder.png') // Placeholder si aucune image
                  }
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.nomEvent}</Text>
                  <Text style={styles.eventLocation}>{event.lieuEvent}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.date_debutEvent).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>Aucun événement disponible</Text>
            </View>
          )}
        </ScrollView>
      </View>
  
     {/* Section Recommandation Personnalisée */}


// ...existing code...
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Recommandation personnalisée</Text>
    <TouchableOpacity
      onPress={async () => {
        const userId = await AsyncStorage.getItem('user_id');
        if (userId) {
          navigation.navigate('JustForYou', { userId: Number(userId) });
        }
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.seeAll}>Tout voir</Text>
        <Image
          source={require('../assets/right-arrow.png')}
          style={{ width: 15, height: 15, marginLeft: 5 }}
        />
      </View>
    </TouchableOpacity>
  </View>

  {/* Activités payantes */}
  <Text style={{ fontWeight: 'bold', marginBottom: 5, marginLeft: 5, marginTop: 10 }}>Activités</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {filteredRecommendedActivities.length > 0 ? (
      filteredRecommendedActivities.map((activity, index) => (
        <TouchableOpacity
          key={`${activity.id}-${index}`}
          style={styles.recoMiniCard}
          onPress={() => navigation.navigate('ActivityDetailScreen', { activityId: activity.id })}
        >
          <Image
            source={
              generateImageUrlR(activity.url ?? null)
                ? { uri: generateImageUrlR(activity.url ?? null) }
                : require('../assets/placeholder.png')
            }
            style={styles.recoMiniImage}
          />
          <Text style={styles.recoMiniTitle} numberOfLines={1}>{activity.nom}</Text>
          <Text style={styles.recoMiniDesc} numberOfLines={1}>{activity.description}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <View style={styles.noRecommendationsContainer}>
        <Text style={styles.noRecommendationsText}>Aucune activité</Text>
      </View>
    )}
  </ScrollView>

  {/* Evénements */}
  <Text style={{ fontWeight: 'bold', marginBottom: 5, marginLeft: 5, marginTop: 10 }}>Evénements</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {filteredRecommendedEvents.length > 0 ? (
      filteredRecommendedEvents.map((event, index) => (
        <TouchableOpacity
          key={`${event.id}-${index}`}
          style={styles.recoMiniCard}
          onPress={() => navigation.navigate('EventDetailScreen', { eventId: event.id })}
        >
          <Image
            source={
              generateImageUrlR(event.url ?? null)
                ? { uri: generateImageUrlR(event.url ?? null) }
                : require('../assets/placeholder.png')
            }
            style={styles.recoMiniImage}
          />
          <Text style={styles.recoMiniTitle} numberOfLines={1}>{event.nom}</Text>
          <Text style={styles.recoMiniDesc} numberOfLines={1}>{event.description}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <View style={styles.noRecommendationsContainer}>
        <Text style={styles.noRecommendationsText}>Aucun événement</Text>
      </View>
    )}
  </ScrollView>

  {/* Postes */}
  <Text style={{ fontWeight: 'bold', marginBottom: 5, marginLeft: 5, marginTop: 10 }}>Postes</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {filteredRecommendedPosts.length > 0 ? (
      filteredRecommendedPosts.map((post, index) => (
        <TouchableOpacity
          key={`${post.id}-${index}`}
          style={styles.recoMiniCard}
          onPress={() => navigation.navigate('PostDetailScreen', { postId: post.id })}
        >
          <Image
            source={
              generateImageUrlR(post.url ?? null)
                ? { uri: generateImageUrlR(post.url ?? null) }
                : require('../assets/placeholder.png')
            }
            style={styles.recoMiniImage}
          />
          <Text style={styles.recoMiniTitle} numberOfLines={1}>{post.nom}</Text>
          <Text style={styles.recoMiniDesc} numberOfLines={1}>{post.description}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <View style={styles.noRecommendationsContainer}>
        <Text style={styles.noRecommendationsText}>Aucun poste</Text>
      </View>
    )}
  </ScrollView>
</View>
<View style={{height: 45}}></View>
   </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={filteredCategories}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      // Remplacez le renderItem actuel dans le FlatList par celui-ci
      renderItem={({ item }) => {
        const categoryImages = randomCategoryImages.find(
          (randomImage) => randomImage.categoryId === item.id
        )?.images || [];
      
        return (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('CategoryFilter', {
                categoryId: item.id,
                categoryName: item.nomCat,
              })
            }
          >
           <View style={styles.imageGrid}>
        {categoryImages.map((imageUrl, index) => (
          <View key={index} style={styles.gridItem}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage} />
            )}
          </View>
        ))}
      </View>
      // Dans le renderItem du FlatList, modifiez la section du badge
<View style={styles.categoryTextContainer}>
  <Text style={styles.categoryName}>{item.nomCat}</Text>
  <View style={styles.countBadge}>
    <Text style={styles.countText}>
      {item.activites_payantes_count || 0}
    </Text>
    <Text style={styles.countLabel}>
      {item.activites_payantes_count === 1 ? 'activité' : 'activités'}
    </Text>
  </View>
</View>
    </TouchableOpacity>
  );
}}
    />
  );
};

const styles = StyleSheet.create({
  recoMiniCard: {
  width: 120,
  height: 160,
  marginRight: 12,
  backgroundColor: '#fff',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: 8,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 2,
},
recoMiniImage: {
  width: 100,
  height: 70,
  borderRadius: 8,
  backgroundColor: '#eee',
},
recoMiniTitle: {
  fontSize: 13,
  fontWeight: 'bold',
  color: '#333',
  marginTop: 8,
},
recoMiniDesc: {
  fontSize: 11,
  color: '#666',
  marginTop: 2,
},
  noRecommendationsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  noRecommendationsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  recommendationCard: {
    width: 150,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
    alignItems: 'center',
  },
  
  recommendationImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
   notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
 PA : {

height:280,

 },
    // Conteneur principal pour la barre de navigation
    navigationContainer: {
      position: 'relative',
      width: '100%',
      paddingVertical: 10,
     
    },
  
    // Barre arrière-plan pour séparer les boutons
    navigationBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: '#D9D9D9', // Couleur légère pour la barre arrière-plan
      zIndex: -1, // Placez-la derrière les boutons
      borderRadius: 10,
      marginHorizontal: 10,
      marginTop: 5,
    },
  
    // Conteneur des boutons
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1, // Placez les boutons au-dessus de la barre arrière-plan
    },
  
    // Style du bouton
    navButton: {
      backgroundColor: '#4A7C87', 
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderTopLeftRadius: 20,
  borderTopRightRadius: 10,
  borderBottomRightRadius: 20,
  borderBottomLeftRadius: 10,
  marginHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    // Effet d'ombre pour un look 3D
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3, // Pour Android
    },
  
    // Texte du bouton
    navButtonText: {
      color: '#fff', // Texte blanc pour contraste
      fontSize: 14,
      fontWeight: 'bold',
    },
 
    flashSaleImageContainer: {
      position: 'relative',
      width: 200,
      height: 100,
      borderRadius: 10,
      overflow: 'hidden', // Pour que la superposition respecte les bordures arrondies
    },
    flashSaleImage: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      resizeMode: 'cover',
    },
    discountOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(255, 69, 0, 0.8)', // Rouge vif avec transparence
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderBottomRightRadius: 10,
      transform: [{ skewX: '-20deg' }], // Inclinaison de -20 degrés
      zIndex: 1, // S'assurer que la superposition est au-dessus de l'image
    },
    discountText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    eventTitle: {
      marginTop: 8,
      fontSize: 16,
      fontWeight: 'bold',
      color: "#D7A738", 
    },

 
  container: {
    flex: 1,
    backgroundColor: "#DCDCDC",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },  postLocation: {
    fontSize: 12,
    color: '#666',
  },postContent: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D7A738", // Couleur du titre
     left: -40
  
  },
  countBadge: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8EB6AD',
    marginRight: 4,
  },
  
  countLabel: {
    fontSize: 12,
    color: '#666',
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
   categoryCard: {
    flex: 1,
    margin: 8, 
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden', // Pour que les images respectent le borderRadius
  },

  categoryImagesContainer: {
    width: '100%',
    height: 100, // Augmenté pour plus d'espace vertical
  },

  mainImageContainer: {
    width: '100%',
    height: 15, // Image principale plus grande
    backgroundColor: '#f5f5f5',
  },
  eventContent: {
    padding: 12,
  },
  mainCategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2, // Plus de padding
    height: 80, // Plus de hauteur pour la grille
   
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
  gridItem: {
    width: '50%',
    height: '50%', // Utilise toute la hauteur disponible
    padding: 2, // Plus d'espace entre les images
  },

  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },

  categoryTextContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 4,
  },

  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  publiciteContainer: {
    height: 250,
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
  
  publicitePlaceholderText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
input: {
    height: 40,
    width: 150,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    color: "#4A7C87",
    left: -30
  },
  publicite: {
    height: 150,
    width: "100%",
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 0,
    marginTop:10
  },
  flashSaleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  flashSaleText: {
    fontSize: 16,
    color: "red",
  },
  activityText: {
    fontSize: 16,
    color: "black",
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    margin: 2,
    borderRadius: 6,
  },
  noImageText: {
    fontSize: 12,
    color: "gray",
    fontStyle: "italic",
  },

  countContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#E3E3E3",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  count: {
    fontSize: 14,
    color: "black",
    fontFamily: "Rakkas-Regular",
  },
  seeAll: {
    fontSize: 15,
    color: "#202020",
    fontWeight: "bold",
    marginTop:10
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    padding: 10,
  },
  
  categoryImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  publiciteDuration: {
    color: '#fff',
    fontSize: 12,
  },
  sectionContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  
    marginBottom: 10,
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
  scrollViewContent: {
    paddingBottom: 20,
  },
  eventItem: {
    marginHorizontal: 10,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  eventImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  eventLocation: {
    fontSize: 14,
    color: "#8EB6AD",
    marginTop: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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

  
 

});

export default Acceuil;

function debugImageUrl(url: string): string | undefined {
  throw new Error("Function not implemented.");
}
