import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './sidebar.css';
const SidebarEn = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const location = useLocation();

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  return (
    <nav id="sidebar" className="sidebar-wrapper">
      {/* Profil dans la barre latérale */}


      {/* Menu principal */}
      <div className="sidebar-content">
        <ul className="sidebar-menu">

          <li className={location.pathname === '/enterprise/dashboardEn' ? 'active' : ''}>
            <Link to="/enterprise/dashboardEn">
              <i className="bi bi-pie-chart"></i>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>
          {/* <li className={location.pathname === "/enterprise/analyticsEn" ? "active" : ""}>
            <Link to="/enterprise/analyticsEn">
              <i className="bi bi-bar-chart-line"></i>
              <span className="menu-text">Analytics</span>
            </Link>
          </li> */}
          <li className={location.pathname === "/enterprise/categories" ? "active" : ""}>
            <Link to="/enterprise/categories">
              <i className="bi bi-list-ul"></i>
              <span className="menu-text">Categories</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/activitiesEn" ? "active" : ""}>
            <Link to="/enterprise/activitiesEn">
              <i className="bi bi-box"></i>
              <span className="menu-text">Activities</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/eventsEn" ? "active" : ""}>
            <Link to="/enterprise/eventsEn">
              <i className="bi bi-calendar2"></i>
              <span className="menu-text">Events</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/postsEn" ? "active" : ""}>
            <Link to="/enterprise/postsEn">
              <i className="bi bi-geo-alt"></i>
              <span className="menu-text">Publications</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/advertisementsEn" ? "active" : ""}>
            <Link to="/enterprise/advertisementsEn">
              <i className="bi bi-badge-ad"></i>
              <span className="menu-text">Advertisements</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/clients" ? "active" : ""}>
            <Link to="/enterprise/clients">
              <i className="bi bi-people"></i>
              <span className="menu-text">Clients</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/ReservationsEn" ? "active" : ""}>
            <Link to="/enterprise/ReservationsEn">
              <i className="bi bi-calendar-check"></i>
              <span className="menu-text">Reservations</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/subscriptions" ? "active" : ""}>
            <Link to="/enterprise/subscriptions">
              <i className="bi bi-credit-card"></i>
              <span className="menu-text">Subscriptions</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/profile" ? "active" : ""}>
            <Link to="/enterprise/profile">
              <i className="bi bi-person"></i>
              <span className="menu-text">Profile</span>
            </Link>
          </li>
          <li className={location.pathname === "/enterprise/settings" ? "active" : ""}>
            <Link to="/enterprise/settings">
              <i className="bi bi-gear"></i>
              <span className="menu-text">Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarEn;