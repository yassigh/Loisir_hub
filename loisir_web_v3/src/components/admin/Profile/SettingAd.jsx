import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../../../services/authService';
import { uploadImage, getImageUrl } from '../../../services/imageService';
const AUTH_BASE_URL = 'http://127.0.0.1:8001/api'; // Auth Service
function SettingAd() {
  // État pour stocker les détails de l'administrateur
  const [adminDetails, setAdminDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    numTelU: '',
    imageU: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les détails de l'administrateur au chargement du composant
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const { user } = await getUserProfile();
        // Remplacer les valeurs undefined par des chaînes vides ou null
        const sanitizedUser = {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          numTelU: user.numTelU || '',
          imageU: user.imageU || null,
        };
        setAdminDetails(sanitizedUser);
      } catch (err) {
        setError('Failed to load admin details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDetails();
  }, []);

  // Gérer les changements dans les champs de texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer le changement de fichier (image de profil)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAdminDetails((prev) => ({ ...prev, imageU: file }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      const formData = new FormData();
      formData.append('first_name', adminDetails.first_name);
      formData.append('last_name', adminDetails.last_name);
      formData.append('email', adminDetails.email);
  
      if (adminDetails.numTelU) {
        formData.append('numTelU', adminDetails.numTelU);
      }
  
      // Si une nouvelle image a été sélectionnée, télécharger l'image et utiliser le chemin renvoyé
      if (adminDetails.imageU && adminDetails.imageU instanceof File) {
        const imageResponse = await uploadImage(adminDetails.imageU);
        formData.append('imageU', imageResponse.path); // Utiliser le chemin de l'image
      } else {
        // Sinon, utiliser le chemin existant de l'image
        if (adminDetails.imageU) {
          formData.append('imageU', adminDetails.imageU);
        }
      }
  
      console.log('Submitting data:', Object.fromEntries(formData));
      const response = await updateUserProfile(formData);
      if (response.user) {
        setAdminDetails(response.user);
        setUpdateStatus({
          type: 'success',
          message: 'Profile updated successfully!',
        });
      }
    } catch (err) {
      setError(err.message);
      setUpdateStatus({
        type: 'error',
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  //v2.0
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   setError(null);

  //   try {
  //     const formData = new FormData();
  //     formData.append('first_name', adminDetails.first_name);
  //     formData.append('last_name', adminDetails.last_name);
  //     formData.append('email', adminDetails.email);

  //     if (adminDetails.numTelU) {
  //       formData.append('numTelU', adminDetails.numTelU);
  //     }

  //     // Télécharger l'image
  //     if (adminDetails.imageU && adminDetails.imageU instanceof File) {
  //       const imageResponse = await uploadImage(adminDetails.imageU);
  //       formData.append('imageU', imageResponse.path);
  //     }

  //     console.log('Submitting data:', Object.fromEntries(formData));
  //     const response = await updateUserProfile(formData);

  //     if (response.user) {
  //       setAdminDetails(response.user);
  //       setUpdateStatus({
  //         type: 'success',
  //         message: 'Profile updated successfully!',
  //       });
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //     setUpdateStatus({
  //       type: 'error',
  //       message: err.message,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  //v1.0
  // Soumettre les modifications
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setIsSubmitting(true);
  //     setError(null);

  //     try {
  //         const formData = new FormData();

  //         // Required fields
  //         formData.append('first_name', adminDetails.first_name);
  //         formData.append('last_name', adminDetails.last_name);
  //         formData.append('email', adminDetails.email);

  //         // Optional fields
  //         if (adminDetails.numTelU) {
  //             formData.append('numTelU', adminDetails.numTelU);
  //         }

  //         if (adminDetails.imageU && adminDetails.imageU instanceof File) {
  //             formData.append('imageU', adminDetails.imageU);
  //         }

  //         console.log('Submitting data:', Object.fromEntries(formData));

  //         const response = await updateUserProfile(formData);

  //         if (response.user) {
  //             setAdminDetails(response.user);
  //             setUpdateStatus({
  //                 type: 'success',
  //                 message: 'Profile updated successfully!'
  //             });
  //         }
  //     } catch (err) {
  //         setError(err.message);
  //         setUpdateStatus({
  //             type: 'error',
  //             message: err.message
  //         });
  //     } finally {
  //         setIsSubmitting(false);
  //     }
  // };

  // Feedback visuel
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">
        {/* Breadcrumb start */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="index-2.html" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Settings</li>
        </ol>
      </div>
      <div className="app-body">
        {/* Row start */}
        <div className="row gx-3">
          <div className="col-xxl-12">
            <div className="card mb-3">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {updateStatus && (
                    <div className={`alert alert-${updateStatus.type} mb-3`}>
                      {updateStatus.message}
                    </div>
                  )}
                  <div className="row gx-3">
                    <div className="col-6">
                      {/* Prénom */}
                      <div className="mb-3">
                        <label htmlFor="first_name" className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="first_name"
                          name="first_name"
                          value={adminDetails.first_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      {/* Nom */}
                      <div className="mb-3">
                        <label htmlFor="last_name" className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="last_name"
                          name="last_name"
                          value={adminDetails.last_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      {/* Email */}
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={adminDetails.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      {/* Numéro de téléphone */}
                      <div className="mb-3">
                        <label htmlFor="numTelU" className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          id="numTelU"
                          name="numTelU"
                          value={adminDetails.numTelU}
                          onChange={handleChange}
                        />
                      </div>
                      {/* Image de profil */}
                      <div className="mb-3">
                        <label htmlFor="imageU" className="form-label">Profile Picture</label>
                        {adminDetails.imageU && (
                          <div className="mb-2">
                            <img
                              src={getImageUrl(adminDetails.imageU)}
                              alt="Profile"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          id="imageU"
                          name="imageU"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Boutons de soumission */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
                      Reset
                    </button>
                    <button type="submit" className="btn btn-success">
                      Update
                    </button>
                    {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Row end */}
      </div>
    </div>
  );
}

export default SettingAd;