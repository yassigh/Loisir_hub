import React, { useEffect, useState } from 'react';
import defaultImage from '../../../images/1.png';
import { Link } from 'react-router-dom';
import { getUserProfile, desactivateAccount } from '../../../services/authService';

const AUTH_BASE_URL = 'http://127.0.0.1:8001/api'; // Auth Service

function ProfileEn() {
  const [entrepriseDetails, setEntrepriseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntrepriseDetails = async () => {
      try {
        const { user } = await getUserProfile();
        setEntrepriseDetails(user);
      } catch (error) {
        console.error('Error fetching entreprise details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepriseDetails();
  }, []);

  const handleDesactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account?')) {
      try {
        await desactivateAccount('entreprise');
        alert('Account deactivated successfully.');
        window.location.href = '/'; // Redirect to home or login page
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
      <div className="app-hero-header d-flex align-items-start">
        {/* Breadcrumb start */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{ 
    color: '#4a7c87', 
  
  }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{ 
    color: '#4a7c87', 
  
  }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Profile</li>
        </ol>
      </div>
      <div className="app-body">
        {/* Row start */}
        <div className="row justify-content-center">
          <div className="col-xxl-12">
            <div className="card mb-3">
              <div className="card-body">
                {/* Row start */}
                <div className="row align-items-center">
                  <div className="col-auto">
                  <img
                      src={entrepriseDetails?.logoE ? `${AUTH_BASE_URL}/storage/${entrepriseDetails.logoE}` : defaultImage}
                      className="img-5xx rounded-circle"
                      alt="Enterprise Logo"
                    />
                  </div>
                  <div className="col">
                    <h4 className="m-0">{entrepriseDetails?.nomE}</h4>
                  </div>
                  <div className="col-12 col-md-auto">
                    <Link to="/enterprise/settings">
                      <a className="btn btn-outline-primary btn-lg">Settings</a>
                    </Link>
                  </div>
                </div>
                {/* Row end */}
              </div>
            </div>
          </div>
        </div>
        {/* Row end */}
        {/* Row start */}
        <div className="row gx-3">
          <div className="col-xxl-12 col-sm-6 col-12 order-xxl-1 order-xl-2 order-lg-2 order-md-2 order-sm-2">
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title">About</h5>
              </div>
              <div className="card-body">
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-envelope fs-2 me-2"></i> Email:
                  <span>{entrepriseDetails?.email}</span>
                </h6>
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-card-text fs-2 me-2"></i> Matricule:
                  <span>{entrepriseDetails?.matriculeE}</span>
                </h6>
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-facebook fs-2 me-2"></i> Facebook:
                  <a href={entrepriseDetails?.lien_facebook_E} target="_blank" rel="noopener noreferrer">
                    {entrepriseDetails?.lien_facebook_E || 'Not provided'}
                  </a>
                </h6>
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-globe-americas fs-2 me-2"></i> Website:
                  <a href={entrepriseDetails?.lien_site_E} target="_blank" rel="noopener noreferrer">
                    {entrepriseDetails?.lien_site_E || 'Not provided'}
                  </a>
                </h6>
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-geo-alt fs-2 me-2"></i> City:
                  <span>{entrepriseDetails?.villeE}</span>
                </h6>
                <h6 className="d-flex align-items-center mb-3">
                  <i className="bi bi-pin-map fs-2 me-2"></i> Address:
                  <span>{entrepriseDetails?.adresseE}</span>
                </h6>
              </div>
            </div>
          </div>
        </div>
        {/* Row end */}
        {/* Deactivate Account Button */}
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

export default ProfileEn;