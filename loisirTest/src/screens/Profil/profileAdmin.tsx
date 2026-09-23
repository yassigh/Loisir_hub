import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from "axios";
import { Image } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { deleteEntreprise, getEntreprises } from '../services/authService';
import { Alert } from 'react-native';
export default function App() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const token = 'your_token_here'; // Define your token here
  interface Entreprise {
    id: number;
    nom: string;
    created_at: string;
    email: string;
    logo: string;
  }

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
 // Charger les entreprises
 useEffect(() => {
  const fetchEntreprises = async () => {
    try {
      const data = await getEntreprises(token);
      setEntreprises(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les entreprises');
    }
  };

  fetchEntreprises();
}, []);

// Supprimer une entreprise
const handleDeleteEntreprise = async (entrepriseId: number) => {
  try {
    await deleteEntreprise(entrepriseId, token);
    Alert.alert('Succès', 'Entreprise supprimée avec succès');
    setEntreprises(entreprises.filter((entreprise) => entreprise.id !== entrepriseId));
  } catch (error) {
    Alert.alert('Erreur', 'Échec de la suppression');
  }
};
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Image de profil */}
        <View style={styles.profileImageContainer}>
              <Image source={require('../assets/profile.png')} style={styles.profileImage} />
         </View>


       <TouchableOpacity 
        style={styles.adminContainer} 
        onPress={() => setMenuVisible(!isMenuVisible)} >
        <Text style={styles.adminText}>Admin</Text>
       </TouchableOpacity>
{/* Liste déroulante */}
       {isMenuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Paramètres</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: 'red' }]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      )}

       {/* Bouton pour afficher la liste déroulante */}
       <TouchableOpacity 
          style={styles.iconWrapper} 
          onPress={() => setMenuVisible(!isMenuVisible)}
        >
          <Image source={require('../assets/list-text.png')} style={styles.icon} />
        </TouchableOpacity>

        {/* Bouton pour naviguer vers une autre page */}
        <TouchableOpacity 
          style={styles.iconWrapper} 
          // onPress={() => navigation.navigate('')} // Remplace 'SettingsScreen' par le nom de ta page
        >
          <Image source={require('../assets/settings.png')} style={styles.icon} />
        </TouchableOpacity>
        </View>

        {/* Titre */}
        <Text style={styles.greeting}>Hello, Yassine!</Text>

       {/* Section Activity */}
        <View style={styles.activityHeader}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <TouchableOpacity style={styles.seeAllContainer}>
        <Text style={styles.seeAllText}>See All</Text>
        <Text style={styles.seeAllIcon}>➡️</Text>
        </TouchableOpacity>
        </View>

      {/* Images des activités */}
      <ScrollView horizontal style={styles.activities}>
        {/* Remplace ici par des <Image /> */}
        <View style={styles.activityPlaceholder} />
        <View style={styles.activityPlaceholder} />
        <View style={styles.activityPlaceholder} />
      </ScrollView>

      {/* My Orders */}
      <Text style={styles.sectionTitle}>My Orders</Text>
      <View style={styles.orderStatus}>
        <TouchableOpacity style={styles.statusButton}>
          <Text style={styles.statusText}>message</Text>
          {/* Point vert */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusButton}>
          <Text style={styles.statusText}>À revoir</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Entreprises</Text>

      {entreprises.length > 0 ? (
        entreprises.map((entreprise) => (
          <View key={entreprise.id} style={styles.cardContainer}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={{ uri: entreprise.logo || "https://via.placeholder.com/50" }} style={styles.logo} />
            </View>

            {/* Infos de l'entreprise */}
            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{entreprise.nom}</Text>
              <Text style={styles.dateText}>{entreprise.created_at}</Text>
              <Text style={styles.priceText}>{entreprise.email}</Text>
            </View>

            {/* Bouton Supprimer */}
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEntreprise(entreprise.id)}>
            <Text style={styles.deleteIcon}>🗑</Text>
    </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>Aucune entreprise trouvée</Text>
      )}
      {/* Barre de navigation en bas */}
      <View style={styles.bottomNav}>
        {/* <TouchableOpacity>
          <Ionicons name="home-outline" size={30} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={30} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="chatbubble-outline" size={30} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={30} color="gray" />
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
    headerContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between', // Pour espacer les éléments
        paddingHorizontal: 20,
        marginTop: 20,
      },
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
      menuText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
      },
      iconsContainer: {
        flexDirection: 'row', // Aligner horizontalement
        alignItems: 'center',
        position: 'absolute',
        top: 10, 
        right: 20, // Ajuster la position à droite au lieu de left: 300
      },
    
      iconWrapper: {
        width: 40, // Taille du cercle
        height: 40, // Taille du cercle
        borderRadius: 20, // Rendre le fond circulaire
        backgroundColor: '#FFFF', // Couleur du fond
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10, // Espace entre les icônes
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5, // Ombre pour Android
      },
    
      icon: {
        width: 20, // Réduction de la taille de l'icône
        height: 20, // Réduction de la taille de l'icône
        tintColor: '#D7A738', // Couleur de l'icône
      },
      
  
      
      profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
      },
      
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileImageContainer: {
    position: 'absolute',
      // Ajuste la distance du haut
    left: 10,  // Ajuste la distance de la gauche
    width: 60, // Ajuste la taille du cercle
    height: 60,
    borderRadius: 30, // Cercle parfait
    backgroundColor: '#fff', // Fond blanc pour bien ressortir
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Ombre pour Android
  },
  

  
  seeAllContainer: {
    flexDirection: 'row', // Aligner le texte et l'icône horizontalement
    alignItems: 'center',
    backgroundColor: 'transparent', // Pas de fond pour un effet propre
    padding: 5,
  },
  
  seeAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7A738', // Couleur dorée
    marginRight: 5, // Espacement entre le texte et l'icône
  },
  
  seeAllIcon: {
    fontSize: 18,
    color: '#D7A738', // Couleur dorée pour la flèche
  },
  
  adminContainer: { 
    backgroundColor: '#fff', // Fond blanc
    padding: 10, 
    borderTopLeftRadius: 40,    // Coin supérieur gauche
    borderTopRightRadius: 20,   // Coin supérieur droit
    borderBottomLeftRadius: 20, // Coin inférieur gauche
    borderBottomRightRadius: 40,// Coin inférieur droit
    borderWidth: 2,             // Épaisseur de la bordure
    borderColor: '#4A7C87',        // Couleur de la bordure (noir)
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    marginLeft: 100,
  },
  
  adminText: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#D7A738', // Texte en blanc pour contraste
  },
   greeting: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  seeAll: { fontSize: 14, color: '#ff9900' },
  activities: { flexDirection: 'row', marginVertical: 10 },
  activityPlaceholder: { width: 100, height: 100, backgroundColor: '#ddd', marginRight: 10, borderRadius: 10 },
  orderStatus: { 
    flexDirection: 'row',
    justifyContent: 'center',
      marginVertical: 10
     },
  statusButton: {  backgroundColor: '#fff', // Fond blanc
    padding: 10, 
    borderTopLeftRadius: 40,    // Coin supérieur gauche
    borderTopRightRadius: 20,   // Coin supérieur droit
    borderBottomLeftRadius: 20, // Coin inférieur gauche
    borderBottomRightRadius: 40,// Coin inférieur droit
    borderWidth: 2,             // Épaisseur de la bordure
    borderColor: '#4A7C87',        // Couleur de la bordure (noir)
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
},
  statusText: { fontSize: 16, 
    fontWeight: 'bold',
    color: '#D7A738', },
  cardContainer: {
    backgroundColor: '#fff', // Fond blanc pour la carte
    borderRadius: 15, // Coins arrondis pour un effet doux
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Ombre sur Android
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Cercle pour le logo
    backgroundColor: '#D7A738', // Couleur dorée pour le fond du logo
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  
  infoContainer: {
    flex: 1,
  },
  
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A7C87', // Texte en bleu-vert
  },
  
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D7A738', // Prix en doré
  },
  
  deleteButton: {
    backgroundColor: '#4A7C87', // Bouton bleu-vert
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#fff', // Icône blanche
    fontSize: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
    logoPlaceholder: { width: 40, height: 40, backgroundColor: '#ddd', borderRadius: 20 },
  addButton: { alignSelf: 'center', backgroundColor: '#ff9900', padding: 15, borderRadius: 30, marginTop: 20 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: '#f8f8f8', borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 20 },
});
