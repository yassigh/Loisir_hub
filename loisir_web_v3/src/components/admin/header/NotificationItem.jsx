import React from 'react';
import { markAsRead } from '../../../services/notificationService';
import "../../../styles/custom.css";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  if (!notification) return null;

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(notification.id);
      if (onMarkAsRead) onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getShortType = (fullType) => {
    const types = {
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
    };
    return types[fullType] || 'unknown';
  };

  const shortType = getShortType(notification.type);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_activity':
      case 'activity_modified':
      case 'activity_deleted':
        return 'bi-activity';
      case 'new_event':
      case 'event_modified':
      case 'event_deleted':
        return 'bi-calendar-event';
      case 'new_post':
      case 'post_modified':
      case 'post_deleted':
        return 'bi-file-post';
      case 'new_publicite':
      case 'publicite_modified':
      case 'publicite_deleted':
        return 'bi-badge-ad';
      case 'payment_success':
        return 'bi-cash-coin';
      default:
        return 'bi-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'new_activity':
      case 'new_event':
      case 'new_post':
      case 'new_publicite':
      case 'payment_success':
        return 'bg-success';
      case 'activity_modified':
      case 'event_modified':
      case 'post_modified':
      case 'publicite_modified':
        return 'bg-warning';
      case 'activity_deleted':
      case 'event_deleted':
      case 'post_deleted':
      case 'publicite_deleted':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatMessage = (notification, shortType) => {
    const data = notification.data || {};
    switch(shortType) {
      // Activités
      case 'new_activity':
        return `Nouvelle activité: "${data.activity_name || ''}" à ${data.activity_lieu || ''}`;
      case 'activity_modified':
        return `Activité modifiée: "${data.activity_name || ''}"`;
      case 'activity_deleted':
        return `Activité supprimée: "${data.activity_name || ''}"`;
      // Événements
      case 'new_event':
        return `Nouvel événement: "${data.event_name || ''}" à ${data.event_lieu || ''}`;
      case 'event_modified':
        return `Événement modifié: "${data.event_name || ''}"`;
      case 'event_deleted':
        return `Événement supprimé: "${data.event_name || ''}"`;
      // Posts
      case 'new_post':
        return `Nouvelle publication: "${data.post_name || ''}"`;
      case 'post_modified':
        return `Publication modifiée: "${data.post_name || ''}"`;
      case 'post_deleted':
        return `Publication supprimée: "${data.post_name || ''}"`;
      // Publicités
      case 'new_publicite':
        return `Nouvelle publicité créée pour ${data.nbJours || ''} jours`;
      case 'publicite_modified':
        return `Publicité modifiée`;
      case 'publicite_deleted':
        return `Publicité supprimée`;
      // Paiement
      case 'payment_success':
        return `Paiement réussi - ${data.entreprise_nom || data.enterprise_name || ''} a payé ${data.montant || ''} TND pour ${data.type || ''}`;
      default:
        return 'Nouvelle notification';
    }
  };

  return (
  
    <div className="dropdown-item d-flex align-items-start py-2 border-bottom">
      {/* Image ou icône de notification */}
      <div className={`icon-box md ${getNotificationColor(shortType)} rounded-circle me-3 d-flex align-items-center justify-content-center`} style={{ width: 40, height: 40 }}>
        {/* Si tu veux une image dynamique, utilise <img src={...} ... /> */}
        <i className={`bi ${getNotificationIcon(shortType)} text-white fs-4`}></i>
      </div>
      
      <div className="flex-grow-1 m-0">
        <h6 className="mb-1 fw-semibold">
          {notification.data?.enterprise_name || notification.data?.entreprise_nom || 'Non spécifié'}
        </h6>
        <p className="mb-1">{formatMessage(notification, shortType)}</p>
        <p className="small m-0 text-secondary">
          {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
        </p>
      </div>
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
  );
};

export default NotificationItem;