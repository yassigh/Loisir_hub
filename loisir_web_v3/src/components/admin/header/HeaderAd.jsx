//src/components/admin/header/HeaderAd.jsx
import React, { useState, useEffect } from 'react';

import NotificationItem from './NotificationItem';
import MessageItem from './MessageItem';
import { getUserProfile, logoutUser } from '../../../services/authService';
import defaultImage from '../../../images/1.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../../../images/logo_1.png';
import PropTypes from 'prop-types';
import { getNotifications } from '../../../services/notificationService';
import { findOrCreateConversationA, getConnectedUsers } from '../../../services/chatService'; // Importez la fonction pour récupérer les connectés

import Dropdown from 'react-bootstrap/Dropdown';

const AUTH_BASE_URL = 'http://127.0.0.1:8001/api'; // Auth Service
const HeaderAd = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null); // Stocke les informations de l'utilisateur connecté
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showChatList, setShowChatList] = useState(false);



  useEffect(() => {
    // Charger les informations de l'utilisateur connecté
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile.user); // Supposons que `profile.user` contient les données de l'utilisateur
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        // Ajouter ici pour voir toutes les notifications
        console.log('All notifications:', data);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    const fetchConnectedUsers = async () => {
      try {
        const users = await getConnectedUsers(); // Récupère les utilisateurs connectés
        setConnectedUsers(users);
      } catch (error) {
        console.error('Error fetching connected users:', error);
      }
    };

    fetchConnectedUsers();
    fetchUserProfile();
    fetchNotifications();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Affiche un indicateur de chargement
  }
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read_at: new Date().toISOString() }
          : notif
      )
    );
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChatIconClick = async () => {
    setLoading(true);
    try {
      const users = await getConnectedUsers(); // Appel API pour récupérer les utilisateurs connectés
      setConnectedUsers(users); // Met à jour l'état avec les utilisateurs connectés
      setShowChatList(true); // Affiche la liste des utilisateurs connectés
    } catch (error) {
      console.error('Error fetching connected users:', error);
    } finally {
      setLoading(false);
    }
  };
function isRecentMessage(lastMessageDate) {
  if (!lastMessageDate) return false;
  const now = new Date();
  const messageDate = new Date(lastMessageDate);
  const diffHours = (now - messageDate) / (1000 * 3600);
  return diffHours <= 72;
}
  const handleUserClick = async (userId, role) => {
    console.log('ID utilisateur cliqué :', userId, 'Rôle :', role);

    try {
      const conversation = await findOrCreateConversationA(userId, role); // Trouve ou crée une conversation
      console.log('Conversation trouvée ou créée :', conversation);
 // Vérifiez si admin_id est défini
 if (!conversation.admin_id) {
  console.warn('Attention : admin_id est NULL dans la conversation créée ou récupérée.', conversation);
} else {
  console.log('admin_id vérifié :', conversation.admin_id);
}
      navigate(`/admin/chat/${conversation.id}`, { state: { receiverId: userId, receiverType: role } }); // Navigue vers la page de chat
    } catch (error) {
      console.error('Error navigating to conversation:', error);
    }
  };
  return (
    <div className="app-header">
      <div className="d-flex align-items-center">
        {/* Toggle buttons */}
        <div className="d-flex">
          <button className="toggle-sidebar" id="toggle-sidebar">
            <i className="bi bi-list lh-1"></i>
          </button>
          <button className="pin-sidebar" id="pin-sidebar">
            <i className="bi bi-list lh-1"></i>
          </button>
        </div>
<div className="app-brand ms-3">
  <Link to="/admin/dashboard">
    <img src={logo} alt="Logo" height="40" />
  </Link>
</div>
       {/* App header actions */}
        <div className="header-actions ms-auto d-flex align-items-center">
          {/* Chat Icon */}
          <div
            className="chat-icon"
            onClick={handleChatIconClick}
            style={{ cursor: 'pointer', marginRight: '20px', color: "#d7a738" }}
          >
            <i className="bi bi-chat-dots fs-4"></i>
          </div>

          {/* Liste des utilisateurs connectés */}
          {showChatList && (
             <div
    className="chat-list border rounded p-3 shadow bg-white position-absolute"
    style={{
      right: '20px',
      top: '60px',
      zIndex: 1050,
      maxHeight: '320px', // 4 items * 70~80px (ajuste selon ton design)
      overflowY: 'auto',
      minWidth: '300px'
    }}
  >
    <h5 className="text-primary mb-3">Utilisateurs connectés</h5>
    {loading ? (
      <p className="text-center text-muted">Chargement...</p>
    ) : (
      <ul className="list-group">
        {connectedUsers.map((user) => (
          <li
            key={user.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {user.first_name || user.nomE} {user.last_name || ''} ({user.role || 'entreprise'})
              {isRecentMessage(user.last_message_date) && (
                <span style={{ color: '#198754', marginLeft: 8, fontWeight: 'bold', fontSize: 12 }}>
                  il y a un message
                </span>
              )}
            </span>
            <button
              onClick={() => handleUserClick(user.id, user.role || 'entreprise')}
              className="btn btn-sm btn-outline-primary"
            >
              Chat
            </button>
          </li>
        ))}
      </ul>
    )}
    <button
      className="btn btn-secondary mt-3 w-100"
      onClick={() => setShowChatList(false)}
    >
      Fermer
    </button>
  </div>
          )}
          {/* Dropdown for notifications */}
   <Dropdown>
  <Dropdown.Toggle
    variant="link"
    id="dropdown-notifications"
    style={{
      color: "#d7a738",
      fontSize: "1.5rem",
      boxShadow: "none",
      border: "none",
      background: "none",
      padding: 0,
      marginRight: "18px"
    }}
  >
    <i className="bi bi-bell"></i>
    {notifications?.filter(n => !n.read_at).length > 0 && (
      <span
        style={{
          background: "#e74c3c",
          color: "#fff",
          borderRadius: "50%",
          fontSize: "0.75rem",
          padding: "2px 6px",
          position: "absolute",
          top: "6px",
          right: "6px"
        }}
      >
        {notifications.filter(n => !n.read_at).length}
      </span>
    )}
  </Dropdown.Toggle>
  <Dropdown.Menu style={{ minWidth: 320 }}>
    <h5
      className="fw-semibold px-3 py-2"
      style={{
        color: "#d7a738",
        letterSpacing: "1px",
        textTransform: "uppercase",
        margin: 0
      }}
    >
      Notifications
    </h5>
    {notifications && notifications.length > 0 ? (
      notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
        />
      ))
    ) : (
      <div className="text-center py-3">
        <p className="text-muted">Aucune notification</p>
      </div>
    )}
  </Dropdown.Menu>
</Dropdown>

          {/* Dropdown for updates */}
          {/* <Dropdown
            icon="bi-bell"
            label="Updates"
            countLabel="info"
            content={
              <>
                <h5 className="fw-semibold px-3 py-2 text-primary">Updates</h5>
                <NotificationItem
                  initials="DS"
                  bgColor="bg-success"
                  name="Douglass Shaw"
                  message="Membership has been ended."
                  time="Today, 07:30pm"
                />
                <NotificationItem
                  initials="WG"
                  bgColor="bg-danger"
                  name="Willie Garrison"
                  message="Congratulate, James for new job."
                  time="Today, 08:00pm"
                />
                <NotificationItem
                  initials="TJ"
                  bgColor="bg-warning"
                  name="Terry Jenkins"
                  message="Lewis added new schedule release."
                  time="Today, 09:30pm"
                />
                <div className="d-grid mx-3 my-1">
                <button type="button" className="btn btn-primary">View all</button>
                </div>
              </>
            }
          /> */}

          {/* Dropdown for messages */}
          <Dropdown
            icon="bi-envelope-open"
            label="Messages" 
            content={
              <>
                <h5 className="fw-semibold px-3 py-2 text-primary">Messages</h5>
                <MessageItem
                  image="assets/images/user3.png"
                  name="Angelia Payne"
                  message="Membership has been ended."
                  time="Today, 07:30pm"
                />
                <MessageItem
                  image="assets/images/user1.png"
                  name="Clyde Fowler"
                  message="Congratulate, James for new job."
                  time="Today, 08:00pm"
                />
                <MessageItem
                  image="assets/images/user4.png"
                  name="Sophie Michiels"
                  message="Lewis added new schedule release."
                  time="Today, 09:30pm"
                />
                <div className="d-grid mx-3 my-1">
                <button type="button" className="btn btn-primary">View all</button>
                </div>
              </>
            }
          />
        </div>

        {/* User settings dropdown */}
        {/* <div className="dropdown ms-2">
          <a id="userSettings" className="dropdown-toggle d-flex py-2 align-items-center text-decoration-none" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img
              src={user?.imageU ? `${AUTH_BASE_URL}/storage/${user.imageU}` : defaultImage}
              className="rounded-2 img-3x"
              alt="Admin Profile"
            />
            <span className="ms-2 text-truncate d-lg-block d-none">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
          </a>
          <div className="dropdown-menu dropdown-menu-end shadow-lg">
            <div className="header-action-links mx-3 gap-2">
              <a className="dropdown-item" href="profile.html"><i className="bi bi-person text-primary"></i>Profile</a>
              <a className="dropdown-item" href="settings.html"><i className="bi bi-gear text-danger"></i>Settings</a>
              <a className="dropdown-item" href="widgets.html"><i className="bi bi-box text-success"></i>Widgets</a>
            </div>
            <div className="mx-3 mt-2 d-grid">
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div> */}
        {/* <div className="dropdown ms-3">
          <button className="btn btn-link dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown">
            <img src={user?.imageU ? `${AUTH_BASE_URL}/storage/${user.imageU}` : defaultImage} className="rounded-circle me-2" width="40" height="40" alt="" />
            <span >{user?.first_name + user?.last_name}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><Link className="dropdown-item" to="/admin/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
            <li><Link className="dropdown-item" to="/admin/settings"><i className="bi bi-gear me-2"></i>Settings</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
          </ul>
        </div> */}
        <div className="dropdown ms-3">
          <a id="userSettings" className="dropdown-toggle d-flex py-2 align-items-center text-decoration-none" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false"  style={{ color: "#4a7c87", fontWeight: "bold" }}>
            <img
              src={user?.imageU ? `${AUTH_BASE_URL}/storage/${user.imageU}` : defaultImage}
              className="rounded-2 img-3x"
              alt="Admin Profile"
              width="30" height="30"
            />
            <span className="ms-2 text-truncate d-lg-block d-none"  style={{ color: "#4a7c87", fontWeight: "bold" }}>
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
          </a>
          <div className="dropdown-menu dropdown-menu-end shadow-lg">
            <div className="header-action-links mx-3 gap-2">
              <Link className="dropdown-item" to="/admin/profile"><i className="bi bi-person text-primary"></i>Profile</Link>
              <Link className="dropdown-item" to="/admin/settings"><i className="bi bi-gear text-danger"></i>Settings</Link>
              {/* <a className="dropdown-item" href="widgets.html"><Link  to="/admin/profile"><i className="bi bi-box text-success"></i>Widgets</Link></a> */}
            </div>
            <div className="mx-3 mt-2 d-grid">
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
HeaderAd.propTypes = {
  toggleSidebar: PropTypes.func.isRequired
};

export default HeaderAd;