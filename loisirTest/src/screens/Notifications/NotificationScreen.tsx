import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getNotifications, markAsRead } from '../services/notificationService';

interface NotificationData {
    activity_name?: string;
    activity_lieu?: string;
    event_name?: string;
    event_lieu?: string;
    enterprise_name?: string;
    post_name?: string;
    nbJours?: number;
    montant?: number;
    type?: string;
}

interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
  };
  onMarkAsRead: (id: number) => void;
}


interface NotificationData {
    activity_name?: string;
    activity_lieu?: string;
    event_name?: string;
    event_lieu?: string;
    enterprise_name?: string;
    post_name?: string;
    nbJours?: number;
    montant?: number;
    type?: string;
    status?: string;
    dateDebut?: string;
    user_name?: string;
    reason?: string;
    entity_type?: string;
    title?: string;
    nom?: string;
    description?: string;
}

interface NotificationType {
    type: string;
    data: NotificationData;
}

const formatMessage = (notification: NotificationType): string => {
  const data = notification.data;
  const shortType = getShortType(notification.type);
  
  switch(shortType) {
    // Activités
    case 'new_activity':
      return `Nouvelle activité: "${data.activity_name}" à ${data.activity_lieu}`;
    case 'activity_modified':
      return `Activité modifiée: "${data.activity_name}"`;
    case 'activity_deleted':
      return `Activité supprimée: "${data.activity_name}"`;
    
    // Événements  
    case 'new_event':
      return `Nouvel événement: "${data.event_name}" à ${data.event_lieu}`;
    case 'event_modified':
      return `Événement modifié: "${data.event_name}"`;
    case 'event_deleted':
      return `Événement supprimé: "${data.event_name}"`;
    
    // Posts
    case 'new_post':
      return `Nouvelle publication: "${data.post_name}"`;
    case 'post_modified':
      return `Publication modifiée: "${data.post_name}"`;
    case 'post_deleted':
      return `Publication supprimée: "${data.post_name}"`;
    
    // Publicités
    case 'new_publicite':
      return `Nouvelle publicité créée pour ${data.nbJours} jours`;
    case 'publicite_modified':
      return `Publicité modifiée`;
    case 'publicite_deleted':
      return `Publicité supprimée`;
    
    // Paiement
    case 'payment_success':
      return `Paiement réussi - ${data.enterprise_name} a payé ${data.montant} TND pour ${data.type}`;
      
      case 'activity_status_changed':
        return `Activité "${data.activity_name}" ${data.status === 'approved' ? 'approuvée' : 'refusée'}`;
      case 'event_status_changed':
        return `Événement "${data.event_name}" ${data.status === 'approved' ? 'approuvé' : 'refusé'}`;
      case 'post_status_changed':
        return `Publication "${data.post_name}" ${data.status === 'approved' ? 'approuvée' : 'refusée'}`;
      case 'publicite_status_changed':
        return `Publicité ${data.status === 'approved' ? 'approuvée' : 'refusée'}`;
      case 'new_reservation':
        return `Nouvelle réservation pour "${data.activity_name}" le ${data.dateDebut}`;
      case 'reservation_modified':
        return `Réservation modifiée pour "${data.activity_name}" - Nouvelle date: ${data.dateDebut}`;
      case 'reservation_cancelled':
        return `Réservation annulée pour "${data.activity_name}" - Raison: ${data.reason}`;
      case 'payment_failed':
        return `Échec du paiement de ${data.montant} TND pour ${data.type}`;
      case 'reservation_payment_success':
        return `Paiement de réservation réussi - Montant: ${data.montant} TND`;
      case 'reservation_payment_failed':
        return `Échec du paiement de réservation - Montant: ${data.montant} TND`;

      //Recommendations
      case 'daily_recommendation':
        let entityType = '';
        switch(data.type) {
          case 'activite_payante':
            entityType = 'activité';
            break;
          case 'poste':
            entityType = 'publication';
            break;
          case 'evenement':
            entityType = 'événement';
            break;
        }
        return `Recommandation : ${entityType} "${data.nom}" - ${data.description}`;
        default:
            return 'Nouvelle notification';
  }
};

// Fonction pour obtenir le type court de notification
const getShortType = (fullType: string): string => {
  const types: {[key: string]: string} = {
    'App\\Notifications\\Activity\\NewActivityCreated': 'new_activity',
    'App\\Notifications\\Activity\\ActivityModified': 'activity_modified',
    'App\\Notifications\\Activity\\ActivityDeleted': 'activity_deleted',
    'App\\Notifications\\Event\\NewEventCreated': 'new_event',
    'App\\Notifications\\Event\\EventModified': 'event_modified', 
    'App\\Notifications\\Event\\EventDeleted': 'event_deleted',
    'App\\Notifications\\Post\\NewPostCreated': 'new_post',
    'App\\Notifications\\Post\\PostModified': 'post_modified',
    'App\\Notifications\\Post\\PostDeleted': 'post_deleted',
    'App\\Notifications\\Publicite\\NewPubliciteCreated': 'new_publicite',
    'App\\Notifications\\Publicite\\PubliciteModified': 'publicite_modified',
    'App\\Notifications\\Publicite\\PubliciteDeleted': 'publicite_deleted',
    'App\\Notifications\\PayementEntreprise\\PaymentSucceeded': 'payment_success',
    'App\\Notifications\\Activity\\ActivityStatusChanged': 'activity_status_changed',
    'App\\Notifications\\Event\\EventStatusChanged': 'event_status_changed',
    'App\\Notifications\\Post\\PostStatusChanged': 'post_status_changed',
    'App\\Notifications\\Publicite\\PubliciteStatusChanged': 'publicite_status_changed',
    'App\\Notifications\\Reservation\\NewReservationCreated': 'new_reservation',
    'App\\Notifications\\Reservation\\ReservationModified': 'reservation_modified',
    'App\\Notifications\\Reservation\\ReservationCancelled': 'reservation_cancelled',
    'App\\Notifications\\PayementEntreprise\\PaymentFailed': 'payment_failed',
    'App\\Notifications\\Reservation\\ReservationPaymentSuccess': 'reservation_payment_success',
    'App\\Notifications\\Reservation\\ReservationPaymentFailed': 'reservation_payment_failed',
    'App\\Notifications\\Recommendations\\DailyRecommendation': 'daily_recommendation',

  };
  return types[fullType] || 'unknown';
};

const shouldShowUserName = (type: string): boolean => {
  return [
    'new_reservation',
    'reservation_modified',
    'reservation_cancelled',
    'reservation_payment_success',
    'reservation_payment_failed'
  ].includes(getShortType(type));
};
const getDisplayName = (notification: NotificationItemProps['notification']): string => {
  if (shouldShowUserName(notification.type)) {
    return notification.data?.user_name || 'Client non spécifié';
  }
  return notification.data?.enterprise_name || 'Non spécifié';
};

// Mise à jour du rendu de NotificationItem
const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {

  // const getNotificationIcon = (type: string) => {
  //   const shortType = getShortType(type);
  //   switch(shortType) {
  //     case 'new_activity':
  //     case 'activity_modified':
  //     case 'activity_deleted':
  //       return '🎯';
  //     case 'new_event':
  //     case 'event_modified':
  //     case 'event_deleted':
  //       return '📅';
  //     case 'new_post':
  //     case 'post_modified':
  //     case 'post_deleted':
  //       return '📝';
  //     case 'payment_success':
  //       return '💰';
  //     default:
  //       return '🔔';
  //   }
  // };
  // const getNotificationColor = (type: string): string => {
  //   const shortType = getShortType(type);
  //   switch(shortType) {
  //     case 'new_activity':
  //     case 'new_event':
  //     case 'new_post':
  //     case 'new_publicite':
  //       return '#4CAF50';
  //     case 'activity_modified':
  //     case 'event_modified':
  //     case 'post_modified':
  //     case 'publicite_modified':
  //       return '#FFA726';
  //     case 'payment_success':
  //       return '#4CAF50';
  //     default:
  //       return '#9E9E9E';
  //   }
  // };

  const getNotificationIcon = (type: string) => {
    const shortType = getShortType(type);
    switch(shortType) {
      // Activities
      case 'new_activity':
      case 'activity_modified':
      case 'activity_deleted':
      case 'activity_status_changed':
      case 'daily_recommendation':

        return '🎯';
      
      // Events
      case 'new_event':
      case 'event_modified':
      case 'event_deleted':
      case 'event_status_changed':
        return '📅';
      
      // Posts
      case 'new_post':
      case 'post_modified':
      case 'post_deleted':
      case 'post_status_changed':
        return '📝';
      
      // Reservations
      case 'new_reservation':
      case 'reservation_modified':
      case 'reservation_cancelled':
        return '📋';
      
      // Payments
      case 'payment_success':
      case 'reservation_payment_success':
        return '💰';
      case 'payment_failed':
      case 'reservation_payment_failed':
        return '❌';
      
      // Publicity
      case 'new_publicite':
      case 'publicite_modified':
      case 'publicite_deleted':
      case 'publicite_status_changed':
        return '📢';
      
      default:
        return '🔔';
    }
  };
  
  const getNotificationColor = (type: string): string => {
    const shortType = getShortType(type);
    switch(shortType) {
      // Success states
      case 'new_activity':
      case 'new_event':
      case 'new_post':
      case 'new_publicite':
      case 'new_reservation':
      case 'payment_success':
      case 'reservation_payment_success':
        return '#4CAF50'; // Green
      
      // Warning/Modified states
      case 'activity_modified':
      case 'event_modified':
      case 'post_modified':
      case 'publicite_modified':
      case 'reservation_modified':
        return '#FFA726'; // Orange
      
      // Error/Deleted states
      case 'activity_deleted':
      case 'event_deleted':
      case 'post_deleted':
      case 'publicite_deleted':
      case 'reservation_cancelled':
      case 'payment_failed':
      case 'reservation_payment_failed':
        return '#F44336'; // Red
      
      // Status changed
      case 'activity_status_changed':
      case 'event_status_changed':
      case 'post_status_changed':
      case 'publicite_status_changed':
        return '#2196F3'; // Blue
      
      default:
        return '#9E9E9E'; // Grey
    }
  };

  return (
    // <TouchableOpacity 
    //   style={[
    //     styles.notificationItem,
    //     !notification.read_at && styles.unreadNotification,
    //   ]}
    //   onPress={() => onMarkAsRead(notification.id)}
    // >
    //   <View style={[
    //     styles.iconContainer,
    //     { backgroundColor: getNotificationColor(notification.type) }
    //   ]}>
    //     <Text style={styles.icon}>
    //       {getNotificationIcon(notification.type)}
    //     </Text>
    //   </View>
    //   <View style={styles.contentContainer}>
    //     <Text style={styles.title}>
    //       {notification.data?.enterprise_name || 'Non spécifié'}
    //     </Text>
    //     <Text style={styles.message}>
    //       {formatMessage(notification)}
    //     </Text>
    //     <Text style={styles.time}>
    //       {new Date(notification.created_at).toLocaleDateString()}
    //     </Text>
    //   </View>
    // </TouchableOpacity>
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !notification.read_at && styles.unreadNotification,
      ]}
      onPress={() => onMarkAsRead(notification.id)}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: getNotificationColor(notification.type) }
      ]}>
        <Text style={styles.icon}>
          {getNotificationIcon(notification.type)}
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {getDisplayName(notification)}
        </Text>
        <Text style={styles.message}>
          {formatMessage(notification)}
        </Text>
        <Text style={styles.time}>
          {new Date(notification.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
  // return (
  //   <TouchableOpacity 
  //     style={[
  //       styles.notificationItem,
  //       !notification.read_at && styles.unreadNotification
  //     ]}
  //     onPress={() => onMarkAsRead(notification.id)}
  //   >
  //     <View style={styles.iconContainer}>
  //       <Text style={styles.icon}>
  //         {getNotificationIcon(notification.type)}
  //       </Text>
  //     </View>
  //     <View style={styles.contentContainer}>
  //       <Text style={styles.title}>{notification.data?.enterprise_name || 'Non spécifié'}</Text>
  //       <Text style={styles.message}>{formatMessage(notification)}</Text>
  //       <Text style={styles.time}>
  //         {new Date(notification.created_at).toLocaleDateString()}
  //       </Text>
  //     </View>
  //   </TouchableOpacity>
  // );


const NotificationScreen = () => {
  interface Notification {
    id: number;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
  }
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Erreur', 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

interface NotificationReadResponse {
    success: boolean;
}

const handleMarkAsRead = async (notificationId: number): Promise<void> => {
    try {
        await markAsRead(notificationId);
        setNotifications(notifications.map((notif: Notification) => 
            notif.id === notificationId 
                ? { ...notif, read_at: new Date().toISOString() }
                : notif
        ));
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A7C87" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A7C87']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A7C87',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  }
});

export default NotificationScreen;