import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  getCartItems,
  deleteCartItem,
  calculateTotalAcceptedPrice,
} from '../services/cartService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLoisirImageUrl} from '../services/imageService';
import {getEntityImageUrl} from '../services/imageService';
import {initiatePayment} from '../services/paymentService';
import {getReservationHistory} from '../services/reservationService';
import {deleteReservation} from '../services/reservationService';
import EditReservationModal from './EditReservationModal';
import { getReservationById } from '../services/reservationService';

const getetatLabel = (etat: string) => {
  switch (etat) {
    case 'en_attente':
    case 'en attente':
      return {label: 'en attente', color: '#D7A738'};
    case 'accepte':
      return {label: 'accepté', color: '#4A7C87'};
    case 'refuse':
      return {label: 'refusé', color: '#EE4B2B'};
    default:
      return {label: etat, color: '#808080'};
  }
};
interface CartItem {
  id: number;
  panier_id: number;
  reservation_id: number;
  prix: string;
  statut: string;
  reservation: {
    id_Res: number;
    id_Act: number;
    etat: string;
    dateDebut: string;
    dateFin: string;
    payment_status?: string;
    activite_payant: {
      idActP: number;
      nomActP: string;
      images: Array<{url: string}>;
    };
  };
}

interface HistoryItem {
  id_Res: number;
  dateDebut: string;
  dateFin: string;
  montant: number;
  etat: string;
  images?: Array<{url: string}>;
  activite: string;
}
const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<{
    id_Res: number;
    id_Act: number;
    etat: string;
    dateDebut: string;
    dateFin: string;
    heureDebut: string;
    heureFin: string;
    num_tel: string;
    nbPersonnes: number;
    payment_status?: string;
    description?: string;
    montant?: number;
    activite_payant: {
      idActP: number;
      nomActP: string;
      images: Array<{url: string}>;
    };
  } | null>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCartItems();
        console.log("Réponse de l'API :", response);
        setCartItems(response.items || []);
        const total: number =
          response.items?.reduce(
            (acc: number, item: CartItem) => acc + parseFloat(item.prix),
            0,
          ) || 0;
        setTotalPrice(total);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    };

    const fetchHistoryItems = async () => {
      try {
        const historyResponse = await getReservationHistory();
        console.log('Historique des réservations :', historyResponse);
        setHistoryItems(historyResponse || []);
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
      }
    };

    fetchCartItems();
    fetchHistoryItems();
  }, []);

  // Filtrer les réservations à payer
  // Filtrer les réservations à payer
  const toPayItems = cartItems.filter(
    item =>
      // Inclure les réservations en attente et acceptées qui ne sont pas encore payées
      (item.reservation.etat === 'accepte' ||
        item.reservation.etat === 'en attente') &&
      item.reservation.payment_status !== 'payée' &&
      item.statut === 'en_attente',
  );

  // Gestion du paiement
  const handlePayment = async (item: CartItem) => {
    try {
      Alert.alert('Confirmation', `Payer la réservation: ${item.prix} TND ?`, [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Payer',
          onPress: async () => {
            try {
              const paymentResponse = await initiatePayment(
                item.reservation.id_Res,
              );
              console.log('Payment initiated:', paymentResponse);
              Alert.alert('Succès', 'Paiement effectué avec succès');
              // Mettre à jour la liste après paiement
              const updatedItems = cartItems.map(cartItem =>
                cartItem.id === item.id
                  ? {...cartItem, statut: 'paye'}
                  : cartItem,
              );
              setCartItems(updatedItems);
              // Recalculer le total
              const newTotal = await calculateTotalAcceptedPrice();
              setTotalPrice(newTotal);
            } catch (error: any) {
              console.error(
                'Erreur lors du paiement:',
                error.response?.data || error,
              );
              Alert.alert(
                'Erreur',
                error.response?.data?.message ||
                  'Impossible de lancer le paiement',
              );
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Erreur handlePayment:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  // Suppression d'un élément du panier
  //v2.0
  const handleDeleteItem = async (item: CartItem) => {
    try {
      Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment supprimer cette réservation ?',
        [
          {text: 'Annuler', style: 'cancel'},
          {
            text: 'Supprimer',
            onPress: async () => {
              try {
                // D'abord supprimer du panier
                await deleteCartItem(item.id);

                // Ensuite supprimer la réservation
                await deleteReservation(item.reservation.id_Res);

                // Mettre à jour l'interface
                const updatedItems = cartItems.filter(
                  cartItem => cartItem.id !== item.id,
                );
                setCartItems(updatedItems);

                // Recalculer le total
                const newTotal = updatedItems.reduce(
                  (acc, currentItem) => acc + parseFloat(currentItem.prix),
                  0,
                );
                setTotalPrice(newTotal);

                // Rafraîchir l'historique
                const historyResponse = await getReservationHistory();
                setHistoryItems(historyResponse || []);

                Alert.alert('Succès', 'Réservation supprimée avec succès');
              } catch (error: any) {
                console.error(
                  'Erreur détaillée:',
                  error?.response?.data || error,
                );
                Alert.alert(
                  'Erreur',
                  'Impossible de supprimer la réservation. Veuillez réessayer.',
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Erreur handleDeleteItem:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };
  //v1.0
  // const handleDeleteItem = async (item: CartItem) => {
  //   try {
  //     Alert.alert(
  //       'Confirmation',
  //       'Voulez-vous vraiment supprimer cette réservation ?',
  //       [
  //         {
  //           text: 'Annuler',
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'Supprimer',
  //           onPress: async () => {
  //             try {
  //               // Supprimer la réservation
  //               await deleteReservation(item.reservation.id_Res);
  //               // Supprimer du panier
  //               await deleteCartItem(item.id);

  //               // Mettre à jour la liste
  //               const updatedItems = cartItems.filter(
  //                 cartItem => cartItem.id !== item.id
  //               );
  //               setCartItems(updatedItems);

  //               // Recalculer le total
  //               const newTotal = updatedItems.reduce(
  //                 (acc, item) => acc + parseFloat(item.prix),
  //                 0
  //               );
  //               setTotalPrice(newTotal);

  //               Alert.alert('Succès', 'Réservation supprimée avec succès');
  //             } catch (error) {
  //               console.error('Erreur lors de la suppression:', error);
  //               Alert.alert('Erreur', 'Impossible de supprimer la réservation');
  //             }
  //           },
  //         },
  //       ],
  //     );
  //   } catch (error) {
  //     console.error('Erreur handleDeleteItem:', error);
  //     Alert.alert('Erreur', 'Une erreur est survenue');
  //   }
  // };
  const refreshData = async () => {
    try {
      const response = await getCartItems();
      console.log('Données du panier rafraîchies:', response);
      setCartItems(response.items || []);
      const total =
        response.items?.reduce(
          (acc: number, item: CartItem) => acc + parseFloat(item.prix),
          0,
        ) || 0;
      setTotalPrice(total);

      const historyResponse = await getReservationHistory();
      console.log('Historique rafraîchi:', historyResponse);
      setHistoryItems(historyResponse || []);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };
  // Rendu d'un élément du panier
  const renderItem = ({item}: {item: CartItem}) => {
    if (!item?.reservation?.id_Res) return null;
    const etat = getetatLabel(item.reservation?.etat || 'en attente');
    const nomActivite = item.reservation?.activite_payant?.nomActP;
    const imageUrl = item.reservation?.activite_payant?.images?.[0]?.url
      ? getEntityImageUrl(
          item.reservation.activite_payant.images[0].url,
          'activite_payants',
        )
      : null;

    console.log('Rendering item:', {
      id: item.id,
      etat: item.reservation.etat,
      payment_status: item.reservation.payment_status,
      statut: item.statut,
    });
const handleEditReservation = async (item: CartItem) => {
  try {
    const reservationDetails = await getReservationById(item.reservation.id_Res);
    setSelectedReservation({
      ...reservationDetails,
      description: reservationDetails.description || '',
      montant: reservationDetails.montant || 0,
    });
    setEditModalVisible(true);
  } catch (error) {
    Alert.alert('Erreur', "Impossible de récupérer la réservation complète.");
  }
};
    //v2.0
    return (
      <View style={styles.itemContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={
              imageUrl ? {uri: imageUrl} : require('../assets/placeholder.png')
            }
            style={styles.activityImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item)}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>
            {nomActivite || 'Activité inconnue'}
          </Text>
          <Text style={[styles.itemetat, {color: etat.color}]}>
            {etat.label}
          </Text>
          <View style={styles.priceQuantityContainer}>
            <Text style={styles.itemPrice}>{item.prix} TND</Text>
            {/* Afficher le bouton de paiement uniquement pour les réservations acceptées */}
            {item.reservation.etat === 'accepte' &&
              item.statut === 'en_attente' && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayment(item)}>
                  <Text style={styles.payButtonText}>Payer</Text>
                </TouchableOpacity>
              )}
      {item.reservation.etat === 'en attente' && (
  <TouchableOpacity
    style={styles.editButton}
    onPress={() => handleEditReservation(item)}
  >
    <Text style={styles.editButtonText}>✏️</Text>
  </TouchableOpacity>
)}
            {selectedReservation && (
              <EditReservationModal
                isVisible={editModalVisible}
                reservation={{
                  ...selectedReservation,
                  description: selectedReservation.description || '',
                  montant: selectedReservation.montant || 0,
                }}
                onClose={() => {
                  setEditModalVisible(false);
                  setSelectedReservation(null);
                }}
                onUpdate={refreshData}
              />
            )}
          </View>
        </View>
      </View>
    );
  };
  //v1.0
  //   return (
  //     <View style={styles.itemContainer}>
  //       <View style={styles.imageContainer}>
  //       <Image
  //         source={imageUrl ? { uri: imageUrl } : require('../assets/placeholder.png')}
  //         style={styles.activityImage}
  //         resizeMode="cover"
  //       />
  //       <TouchableOpacity
  //         style={styles.deleteButton}
  //         onPress={() => handleDeleteItem(item)}
  //       >
  //         <Text style={styles.deleteButtonText}>🗑️</Text>
  //       </TouchableOpacity>
  //     </View>
  //       <View style={styles.itemDetails}>
  //         <Text style={styles.itemName}>
  //           {nomActivite || 'Activité inconnue'}
  //         </Text>
  //         <Text style={[styles.itemetat, { color: etat.color }]}>
  //           {etat.label}
  //         </Text>
  //         <View style={styles.priceQuantityContainer}>
  //           <Text style={styles.itemPrice}>{item.prix} TND</Text>
  //           {item.reservation.etat === 'accepte' && item.statut !== 'paye' && (
  //             <TouchableOpacity
  //               style={styles.payButton}
  //               onPress={() => handlePayment(item)}
  //             >
  //               <Text style={styles.payButtonText}>Payer</Text>
  //             </TouchableOpacity>
  //           )}
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  // Rendu d'un élément de l'historique
  const renderHistoryItem = ({item}: {item: HistoryItem}) => {
    if (!item) return null;

    const etat = getetatLabel(item.etat || 'en attente');
    const imageUrl = item.images?.[0]?.url
      ? getEntityImageUrl(item.images[0].url, 'activite_payants')
      : null;

    // Assurez-vous que le nom de l'activité est correctement affiché
    const nomActivite = item.activite || 'Activité inconnue';
    return (
      <View style={styles.historyItem}>
        <View style={styles.imageContainer}>
          <Image
            source={
              imageUrl ? {uri: imageUrl} : require('../assets/placeholder.png')
            }
            style={styles.historyImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.historyDetails}>
          <Text style={styles.historyName}>{nomActivite}</Text>
          <Text style={styles.historyDate}>
            {item.dateDebut} au {item.dateFin}
          </Text>
          <Text style={styles.historyPrice}>{item.montant} TND</Text>
          <Text style={[styles.historyetat, {color: etat.color}]}>
            {etat.label}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {/* Titre du Panier */}
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{toPayItems.length}</Text>
        </View>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      {/* Section pour les réservations à payer */}
      {toPayItems?.length > 0 && (
        <View style={styles.toPaySection}>
          <Text style={styles.sectionTitle}>À Payer:</Text>
          <FlatList
            data={toPayItems}
            keyExtractor={item =>
              item?.id?.toString() || Math.random().toString()
            }
            renderItem={renderItem}
          />
        </View>
      )}

      {/* Section pour l'historique des réservations */}
      {historyItems?.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historique:</Text>
          <FlatList
            data={historyItems}
            keyExtractor={item =>
              item?.id_Res?.toString() || Math.random().toString()
            }
            renderItem={renderHistoryItem}
          />
        </View>
      )}

      {/* Total et bouton de paiement */}
      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total {totalPrice?.toFixed(2) || '0.00'} TND
        </Text>
        {toPayItems?.length > 0 && (
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  logo: {
    width: 75,
    height: 25,
    left: 180,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    marginLeft: 8,
    backgroundColor: '#D7A738',
    borderRadius: 16,
    padding: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toPaySection: {
    marginBottom: 16,
  },
  historySection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  activityImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 4,
  },
  deleteButtonText: {
    color: '#D7A738',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  itemDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  itemetat: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    color: '#555',
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#555',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    marginRight: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  historyPrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  historyetat: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A7C87',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#8EB6AD',
    padding: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#4A7C87',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  editButtonText: {
    fontSize: 15,
  },
});

export default CartScreen;
