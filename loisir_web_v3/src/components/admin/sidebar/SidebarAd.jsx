import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Importez useLocation pour détecter l'URL active
// import '../../../styles/custom.css';
import './sidebar.css';

const SidebarAd = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  // Utilisez useLocation pour détecter l'URL active
  const location = useLocation();

  // Fonction pour basculer l'état d'un sous-menu
  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  return (
    <nav id="sidebar" className="sidebar-wrapper">
      <div className="sidebar-content">
      <ul className="sidebar-menu">
          <li className={location.pathname === '/admin/dashboardAd' ? 'active' : ''}>
            <Link to="/admin/dashboardAd">
              <i className="bi bi-pie-chart"></i>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/categoriesAd' ? 'active' : ''}>
            <Link to="/admin/categoriesAd">
              <i className="bi bi-ui-checks-grid"></i>
              <span className="menu-text">Categories</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/activitiesAd' ? 'active' : ''}>
            <Link to="/admin/activitiesAd">
              <i className="bi bi-box"></i>
              <span className="menu-text">Activities</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/eventsAd' ? 'active' : ''}>
            <Link to="/admin/eventsAd">
              <i className="bi bi-calendar2"></i>
              <span className="menu-text">Events</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/postsAd' ? 'active' : ''}>
            <Link to="/admin/postsAd">
              <i className="bi bi-geo-alt"></i>
              <span className="menu-text">Publications</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/advertisementsAd' ? 'active' : ''}>
            <Link to="/admin/advertisementsAd">
              <i className="bi bi-badge-ad"></i>
              <span className="menu-text">Advertisements</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/ReservationsAd' ? 'active' : ''}>
            <Link to="/admin/ReservationsAd">
              <i className="bi bi-calendar-check"></i>
              <span className="menu-text">Reservations</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/subscriptionPlans' ? 'active' : ''}>
            <Link to="/admin/subscriptionPlans">
              <i className="bi bi-credit-card"></i>
              <span className="menu-text">Subscription Plans</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/subscriptionsEn' ? 'active' : ''}>
            <Link to="/admin/subscriptionsEn">
              <i className="bi bi-credit-card"></i>
              <span className="menu-text">Subscriptions </span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/centres-interet' ? 'active' : ''}>
            <Link to="/admin/centres-interet">
              <i className="bi bi-heart"></i>
              <span className="menu-text">Centres d'Intérêt</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/usersAd' ? 'active' : ''}>
            <Link to="/admin/usersAd">
              <i className="bi bi-people"></i>
              <span className="menu-text">Users</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/entreprisesAd' ? 'active' : ''}>
            <Link to="/admin/entreprisesAd">
              <i className="bi bi-building"></i>
              <span className="menu-text">Entreprises</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/profile' ? 'active' : ''}>
            <Link to="/admin/profile">
              <i className="bi bi-person"></i>
              <span className="menu-text">Profile</span>
            </Link>
          </li>
          <li className={location.pathname === '/admin/settings' ? 'active' : ''}>
            <Link to="/admin/settings">
              <i className="bi bi-gear"></i>
              <span className="menu-text">Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarAd;
