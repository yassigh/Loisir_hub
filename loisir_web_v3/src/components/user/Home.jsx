import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import heroBg from '../../images/bac.png';
import img1 from '../../images/1.png';
import logoIcon from '../../images/logoIcon.webp';
import logo1 from '../../images/logob.webp'; // Utilisé comme logo principal
import idea from '../../images/idea.png';
import honor from '../../images/honor.png';
import travelmap from '../../images/travelmap.png';
import personalization from '../../images/personalization.png';
import active from '../../images/active.png';
import reservation from '../../images/reserve.png';
import imgA from '../../images/imgA.png';
import imgB from '../../images/imgB.png';
import imgC from '../../images/imgC.png';
// Ajoute autant d'images que tu veux
function Home() {
  const navigate = useNavigate();
  // Tableau des images pour le slider
  const galleryImages = [
    { src: imgA, alt: "Activité 1" },
    { src: imgB, alt: "Activité 2" },
    { src: imgC, alt: "Activité 3" },
    // Ajoute d'autres images ici
  ];

  // Index de l'image affichée
  const [currentIndex, setCurrentIndex] = useState(0);
 useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [galleryImages.length]);

  return (
    <div className="home-container new-home">
       {/* Header compact et élégant */}
     <header className="home-header new-header">
  <div className="header-content">
    <div className="logo-container">
      <img src={logo1} alt="LoisirHub Logo" className="logo" />
    </div>
    <nav className="nav-bar">
      <ul>
        <li><a href="#about">À propos</a></li>
        <li><a href="#features">Fonctionnalités</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
    <div className="header-actions">
      <button className="btn-primary" onClick={() => navigate('/login')}>Se Connecter</button>
      <button className="btn-secondary" onClick={() => navigate('/register')}>S'Inscrire</button>
    </div>
  </div>
</header>


<section className="hero-gallery-section">
  <div className="hero-gallery-flex">
    {/* Galerie à gauche */}
    <div className="gallery-container">
    
      <div className="gallery-slider-frame">
       
        {galleryImages.map((img, idx) => (
          <img
            key={idx}
            src={img.src}
            alt={img.alt}
            className={`gallery-img${idx === currentIndex ? ' active' : ''}`}
            style={{ zIndex: idx === currentIndex ? 2 : 1 }}
          />
        ))}
      </div>
      <div className="gallery-dots">
        {galleryImages.map((_, idx) => (
          <span
            key={idx}
            className={`gallery-dot${idx === currentIndex ? ' active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
    {/* Hero à droite */}
    <div className="hero-content">
      <div className="hero-text">
        <img src={logoIcon} alt="LoisirHub Icon" className="hero-logo" />
        <h1>Bienvenue sur <span className="brand">LoisirHub</span></h1>
        <p>Découvrez, réservez et vivez les meilleures activités de loisirs en Tunisie !</p>
        <div className="home-buttons">
          <button className="btn-primary" onClick={() => navigate('/login')}>Se Connecter</button>
          <button className="btn-secondary" onClick={() => navigate('/register')}>S'Inscrire</button>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* About Section */}

<section id="about" className="about-section new-section">
  <div className="about-content about-center">
     <h2>À propos de LoisirHub</h2>
    <img src={idea} alt="À propos" className="about-img center-img" />
    <div className="about-desc">
     
      <p>
        LoisirHub est une plateforme innovante qui vous permet de découvrir et réserver des activités de loisirs en Tunisie.<br />
        Profitez d'une expérience unique et explorez les meilleures attractions près de chez vous.
      </p>
    </div>
  </div>
</section>

      {/* Features Section */}
    <section id="features" className="features-section new-section">
  <div className="section-title-container">
    <h2>Nos Fonctionnalités</h2>
  </div>
  <div className="features-list row-features">
    <div className="feature-card small-feature">
      <img src={honor} alt="Valorisation" />
      <span>Visibilité numérique pour les produits locaux</span>
    </div>
    <div className="feature-card small-feature">
      <img src={travelmap} alt="Tourisme" />
      <span>Promotion du tourisme tunisien connecté</span>
    </div>
    <div className="feature-card small-feature">
      <img src={personalization} alt="Personnalisation" />
      <span>Suggestions d’activités selon vos préférences</span>
    </div>
    <div className="feature-card small-feature">
      <img src={reservation} alt="Réservation" />
      <span>Réservation rapide et simple en quelques clics</span>
    </div>
    <div className="feature-card small-feature">
      <img src={active} alt="Notifications" />
      <span>Alertes instantanées sur les nouveautés et les actions</span>
    </div>
  </div>
</section>


     <section className="sponsors-section">
  <h3>Nos sponsors</h3>
  <div className="sponsors-logos">
    <img src={require('../../images/S2.png')} alt="Sponsor 1" />
    <img src={require('../../images/S3.png')} alt="Sponsor 2" />
    <img src={require('../../images/s1.png')} alt="Sponsor 3" />
     <img src={require('../../images/S4.png')} alt="Sponsor 4" />
    {/* Ajoute d'autres logos si besoin */}
  </div>
</section>

      {/* Contact Section */}
 
  <section id="contact" className="contact-section new-section">
  <h2>Contactez-nous</h2>
  <div className="contact-flex">
    <div className="contact-box left">
      <p>
        <span className="contact-icon"><i className="fas fa-envelope"></i></span>
        <strong>Email :</strong> 
        contact@loisirhub.com
      </p>
      <p>
        <span className="contact-icon"><i className="fas fa-phone"></i></span>
        <strong>Téléphone :
          </strong> 
          +216 12 345 678
      </p>
    </div>
    <div className="vertical-divider"></div>
    <div className="contact-box right">
      <p>
        <span className="contact-icon"><i className="fas fa-map-marker-alt"></i></span>
        <strong>Localisation :</strong> Tunis, Tunisie
      </p>
    </div>
  </div>
</section>
  <footer className="home-footer modern-footer">
  <div className="footer-content">
    <p>&copy; 2025 LoisirHub. Tous droits réservés. Tunisie</p>
  </div>
</footer>
    </div>
  );
}

export default Home;