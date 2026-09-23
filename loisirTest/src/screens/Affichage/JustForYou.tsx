import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateImageUrl } from '../services/imageService';
import { Linking } from 'react-native';

type RootStackParamList = {
  JustForYou: { userId: number };
  PostDetailScreen: { postId: number };
  EventDetailScreen: { eventId: number };
  ActivityDetailScreen: { activityId: number };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'JustForYou'>;
type RouteProps = RouteProp<RootStackParamList, 'JustForYou'>;

interface Recommendation {
  id: number;
  nom: string;
  description: string;
  source?: string | null;
  type: 'evenement' | 'activite_payante' | 'poste';
  url?: string | null; // URL de l'image
  image_url?: string | null; // URL spécifique pour les postes Python
}

const JustForYou = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { userId } = route.params; // Récupérez l'ID utilisateur depuis les paramètres
  const [events, setEvents] = useState<Recommendation[]>([]);
  const [activities, setActivities] = useState<Recommendation[]>([]);
  const [posts, setPosts] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // État pour la recherche
  const [pythonPosts, setPythonPosts] = useState<Recommendation[]>([]);
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const apiUrl = `http://192.168.100.122:5000/api/reco/just-for-you/${userId}`;
        const pythonPostsUrl = `http://192.168.100.122:5000/api/posts/${userId}`;
  
        console.log('Envoi de la requête à :', apiUrl);
        const response = await fetch(apiUrl);
        const pythonPostsResponse = await fetch(pythonPostsUrl);
  
        if (!response.ok || !pythonPostsResponse.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
  
        const text = await response.text();
        const pythonPostsText = await pythonPostsResponse.text();
  
        console.log('Réponse brute de l\'API :', text);
        console.log('Réponse brute des postes Python :', pythonPostsText);
  
        const sanitizedText = text.replace(/NaN/g, 'null');
        const sanitizedPythonPostsText = pythonPostsText.replace(/NaN/g, 'null');
  
        const data = JSON.parse(sanitizedText);
        const pythonPostsData = JSON.parse(sanitizedPythonPostsText);
  
        setEvents(data.evenement || []);
        setActivities(data.activite_payante || []);
        setPosts(data.poste || []);
        setPythonPosts(pythonPostsData || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations :', error);
        Alert.alert('Erreur', 'Impossible de récupérer les recommandations. Vérifiez votre connexion réseau.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  // Filtrer les données en fonction de la recherche
  const filteredEvents = events.filter(event => event.nom.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredActivities = activities.filter(activity => activity.nom.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPosts = posts.filter(post => post.nom.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
         <Image source={require('../assets/background2.png')} style={[styles.decorImage, styles.bottomRight]} />
      
      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>  Recommandation </Text>
      <Text style={styles.title}>  personnalisée </Text>

      {/* Barre de recherche */}
      <View style={styles.searchBarContainer}>
  <View style={styles.searchBar}>
    <Image source={require('../assets/search.png')} style={styles.searchIcon} />
    <TextInput
      placeholder="Rechercher par nom..."
      placeholderTextColor="#888"
      value={searchQuery}
      onChangeText={setSearchQuery}
      style={styles.input}
    />
    <TouchableOpacity style={styles.searchButton} onPress={() => console.log('Recherche:', searchQuery)}>
      <Text style={styles.searchButtonText}>Rechercher</Text>
    </TouchableOpacity>
  </View>
</View>
       {/* Section Activités */}
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activités</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredActivities.map((activity, index) => (
            <TouchableOpacity
              key={`${activity.id}-${index}`}
              style={styles.card}
              onPress={() => navigation.navigate('ActivityDetailScreen', { activityId: activity.id })}
            >
              <Image
                source={
                  generateImageUrl(activity.url)
                    ? { uri: generateImageUrl(activity.url) }
                    : require('../assets/placeholder.png')
                }
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{activity.nom}</Text>
              <Text style={styles.cardDescription}>{activity.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Section Événements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Événements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredEvents.map((event, index) => (
            <TouchableOpacity
              key={`${event.id}-${index}`}
              style={styles.card}
              onPress={() => navigation.navigate('EventDetailScreen', { eventId: event.id })}
            >
              <Image
                source={
                  generateImageUrl(event.url)
                    ? { uri: generateImageUrl(event.url) }
                    : require('../assets/placeholder.png')
                }
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{event.nom}</Text>
              <Text style={styles.cardDescription}>{event.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

   

      {/* Section Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredPosts.map((post, index) => (
            <TouchableOpacity
              key={`${post.id}-${index}`}
              style={styles.card}
              onPress={() => navigation.navigate('PostDetailScreen', { postId: post.id })}
            >
              <Image
                source={
                  generateImageUrl(post.url)
                    ? { uri: generateImageUrl(post.url) }
                    : require('../assets/placeholder.png')
                }
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{post.nom}</Text>
              <Text style={styles.cardDescription}>{post.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section Postes Python */}

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Publications Python</Text>
    {pythonPosts.map((post, index) => {
      const imageUrl = `http://192.168.100.122:8001/storage/${post.image_url}`; // Remplacez 127.0.0.1 par votre adresse IP locale si nécessaire
      console.log(`Image URL : ${imageUrl}`);
      return (
        <View key={`${post.nom}-${index}`} style={styles.pythonPostContainer}>
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.pythonPostImage}
          />
        <View style={styles.pythonPostContent}>
          <Text style={styles.pythonPostDescription}>{post.description}</Text>
          <Text
            style={styles.pythonPostSource}
            onPress={() => Linking.openURL(post.source || '')} // Ouvrir la source dans le navigateur
          >
            Source : {post.source}
          </Text>
        </View>
      </View>
    );
  })} 
</View> 
<View style={{height: 70}}></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pythonPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  pythonPostImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 16,
  },
  pythonPostContent: {
    flex: 1,
  },
  pythonPostDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  pythonPostSource: {
    fontSize: 12,
    color: '#666',
  },
  decorImage: {
    position: 'absolute',
    width: 500,
    height: 390,
    opacity: 0.3, // Réduire l'opacité pour que l'image de fond soit plus subtile
  },
  bottomRight: {
    bottom: -150,
    right: -70,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width:170, height:45,
    left:180,
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

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
     color: '#D7A738',
     top:-45
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4A7C87',
  },
  card: {
    width: 150,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default JustForYou;