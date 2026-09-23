import React from 'react';
import { markAsRead } from '../../../services/notificationService';
import "../../../styles/custom.css";


const NotificationItem = ({ notification, onMarkAsRead }) => {
  // console.log('Notification data:', notification);

  if (!notification) {
    return null;
  }
  const handleMarkAsRead = async () => {
    try {
      await markAsRead(notification.id);
      if (onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Extraire le type court de la notification
  const getShortType = (fullType) => {
    const types = {
      'App\\Notifications\\Activity\\NewActivityCreated': 'new_activity',
      'App\\Notifications\\Activity\\ActivityStatusChanged': 'activity_status_changed',
      'App\\Notifications\\Event\\NewEventCreated': 'new_event',
      'App\\Notifications\\Event\\EventStatusChanged': 'event_status_changed',
      'App\\Notifications\\Post\\NewPostCreated': 'new_post',
      'App\\Notifications\\Post\\PostStatusChanged': 'post_status_changed',
      'App\\Notifications\\Publicite\\NewPubliciteCreated': 'new_publicite',
      'App\\Notifications\\Publicite\\PubliciteStatusChanged': 'publicite_status_changed',
      'App\\Notifications\\Reservation\\NewReservationCreated': 'new_reservation',
      'App\\Notifications\\Reservation\\ReservationModified': 'reservation_modified',
      'App\\Notifications\\Reservation\\ReservationCancelled': 'reservation_cancelled'
    };
    return types[fullType] || 'unknown';
  };

  const shortType = getShortType(notification.type);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_activity':
      case 'activity_status_changed':
        return 'bi-activity';
      case 'new_event':
      case 'event_status_changed':
        return 'bi-calendar-event';
      case 'new_post':
      case 'post_status_changed':
        return 'bi-file-post';
      case 'new_publicite':
      case 'publicite_status_changed':
        return 'bi-badge-ad';
      case 'new_reservation':
      case 'reservation_modified':
      case 'reservation_cancelled':
        return 'bi-calendar-check';
      default:
        return 'bi-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_activity':
      case 'new_event':
      case 'new_post':
      case 'new_publicite':
        return 'bg-success';
      case 'activity_status_changed':
      case 'event_status_changed':
      case 'post_status_changed':
      case 'publicite_status_changed':
        return notification.data?.status === 'approved' ? 'bg-success' : 'bg-danger';
      case 'new_reservation':
        return 'bg-success';
      case 'reservation_modified':
        return 'bg-warning';
      case 'reservation_cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatMessage = (notification, shortType) => {
    const data = notification.data;

    switch (shortType) {
      case 'new_activity':
        return `Nouvelle activité: "${data.activity_name}" à ${data.activity_lieu}`;
      case 'activity_status_changed':
        return `Activité "${data.activity_name}" ${data.status === 'approved' ? 'approuvée' : 'refusée'}`;
      case 'new_event':
        return `Nouvel événement: "${data.event_name}" à ${data.event_lieu}`;
      case 'event_status_changed':
        return `Événement "${data.event_name}" ${data.status === 'approved' ? 'approuvé' : 'refusé'}`;
      case 'new_post':
        return `Nouvelle publication: "${data.post_name}" à ${data.post_lieu}`;
      case 'post_status_changed':
        return `Publication "${data.post_name}" ${data.status === 'approved' ? 'approuvée' : 'refusée'}`;
      case 'new_publicite':
        return `Nouvelle publicité créée pour ${data.nbJours} jours`;
      case 'publicite_status_changed':
        return `Publicité ${data.status === 'approved' ? 'approuvée' : 'refusée'}`;
      case 'new_reservation':
        return `Nouvelle réservation pour "${data.activity_name}" le ${data.dateDebut}`;
      case 'reservation_modified':
        return `Réservation modifiée pour "${data.activity_name}" - Nouvelle date: ${data.dateDebut}`;
      case 'reservation_cancelled':
        return `Réservation annulée pour "${data.activity_name}" - Raison: ${data.reason}`;
      default:
        return 'Nouvelle notification';
    }
  };
//v2.0
const shouldShowUserName = (type) => {
  return [
    'new_reservation',
    'reservation_modified',
    'reservation_cancelled'
  ].includes(type);
};

const getDisplayName = (notification, shortType) => {
  if (shouldShowUserName(shortType)) {
    return notification.data?.user_name || 'Client non spécifié';
  }
  return notification.data?.enterprise_name || 'Non spécifié';
};

return (
  <div className="dropdown-item">
    <div className="d-flex py-2 border-bottom">
      <div className={`icon-box md ${getNotificationColor(shortType)} rounded-circle me-3`}>
        <i className={`bi ${getNotificationIcon(shortType)} text-white fs-4`}></i>
      </div>
      <div className="m-0">
        <h6 className="mb-1 fw-semibold">{getDisplayName(notification, shortType)}</h6>
        <p className="mb-1">{formatMessage(notification, shortType)}</p>
        <p className="small m-0 text-secondary">
          {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
        </p>
      </div>
      {/* {!notification.read_at && (
          <button 
            className="btn btn-sm btn-outline-primary ms-2"
            onClick={handleMarkAsRead}
          >
            <i className="bi bi-check2"></i>
          </button>
        )} */}
        {!notification.read_at && (
  <button 
    className="btn btn-sm btn-mark-read ms-2"
    onClick={handleMarkAsRead}
    title="Marquer comme lu"
  >
    <i className="bi bi-check-circle-fill text-success"></i>
  </button>
)}
    </div>
  </div>
);
};

//v1.0
//   return (
//     <div className="dropdown-item">
//       <div className="d-flex py-2 border-bottom">
//         <div className={`icon-box md ${getNotificationColor(shortType)} rounded-circle me-3`}>
//           <i className={`bi ${getNotificationIcon(shortType)} text-white fs-4`}></i>
//         </div>
//         <div className="m-0">
//           <h6 className="mb-1 fw-semibold">{notification.data?.enterprise_name || 'Non spécifié'}</h6>
//           <p className="mb-1">{formatMessage(notification, shortType)}</p>
//           <p className="small m-0 text-secondary">
//             {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

export default NotificationItem;