import React, { useEffect, useState } from 'react';
import defaultImage from '../../../images/1.png'; // Image par défaut
import { Link } from 'react-router-dom';
import { getUserProfile, desactivateAccount } from '../../../services/authService';
const AUTH_BASE_URL = 'http://127.0.0.1:8001/api'; // Auth Service

function ProfileAd() {
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const { user } = await getUserProfile();
        setAdminDetails(user);
      } catch (error) {
        console.error('Error fetching admin details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  const handleDesactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account?')) {
      try {
        await desactivateAccount('admin');
        alert('Account deactivated successfully.');
        window.location.href = '/'; // Rediriger vers la page d'accueil ou de connexion
      } catch (error) {
        console.error('Error deactivating account:', error);
        alert('Failed to deactivate account.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ marginLeft: '10px' }}>
      {/* Header avec fil d'Ariane */}
      <div className="app-hero-header d-flex align-items-start">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"  style={{ 
    color: '#4a7c87', 
  
  }}></i>
            <a href="index-2.html" className="text-decoration-none"  style={{ 
    color: '#4a7c87', 
  
  }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Profile</li>
        </ol>
      </div>

      {/* Corps principal */}
      <div className="app-body">
        {/* Section Profil */}
        <div className="row justify-content-center">
          <div className="col-xxl-12">
            <div className="card mb-3">
              <div className="card-body">
                {/* Row start */}
                <div className="row align-items-center">
                  <div className="col-auto">
                  <img
                      src={adminDetails?.imageU ? `${AUTH_BASE_URL}/storage/${adminDetails.imageU}` : defaultImage}
                      className="img-5xx rounded-circle"
                      alt="Admin Profile Picture"
                    />
                  </div>
                  <div className="col">
                    <h4 className="m-0">{`${adminDetails?.first_name} ${adminDetails?.last_name}`}</h4>
                  </div>
                  <div className="col-12 col-md-auto">
                    <Link to="/admin/settings">
                      <a className="btn btn-outline-primary btn-lg">Settings</a>
                    </Link>
                  </div>
                </div>
                {/* Row end */}
              </div>
            </div>
          </div>
        </div>

        {/* Section À propos */}
        <div className="row gx-3">
          <div className="col-xxl-12 col-sm-6 col-12 order-xxl-1 order-xl-2 order-lg-2 order-md-2 order-sm-2">
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title">About</h5>
              </div>
              <div className="card-body">
                {/* Email */}
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-envelope fs-2 me-2"></i> Email:
                  <span>{adminDetails?.email}</span>
                </h6>
                {/* Numéro de téléphone */}
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-telephone fs-2 me-2"></i> Phone Number:
                  <span>{adminDetails?.numTelU || 'Not provided'}</span>
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Désactiver le compte */}
        <div className="row gx-3">
          <div className="col-12">
            <button className="btn btn-danger" onClick={handleDesactivateAccount}>
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileAd;