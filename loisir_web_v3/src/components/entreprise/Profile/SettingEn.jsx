//v2.0
import React, { useEffect, useState } from 'react';
import { getUserProfile, updateEntrepriseProfile } from '../../../services/authService';
import { uploadLogo, getImageUrl } from '../../../services/imageService';

function SettingEn() {
  const [entrepriseDetails, setEntrepriseDetails] = useState({
    nomE: '',
    email: '',
    matriculeE: '',
    villeE: '',
    adresseE: '',
    lien_facebook_E: '',
    lien_site_E: '',
    logoE: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntrepriseDetails = async () => {
      try {
        const { user } = await getUserProfile();
        const sanitizedUser = {
          nomE: user.nomE || '',
          email: user.email || '',
          matriculeE: user.matriculeE || '',
          villeE: user.villeE || '',
          adresseE: user.adresseE || '',
          lien_facebook_E: user.lien_facebook_E || '',
          lien_site_E: user.lien_site_E || '',
          logoE: user.logoE || null,
        };
        setEntrepriseDetails(sanitizedUser);
      } catch (err) {
        setError('Failed to load entreprise details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEntrepriseDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntrepriseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEntrepriseDetails((prev) => ({ ...prev, logoE: file }));
  };
//v2.0
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
      const formData = new FormData();
      formData.append('nomE', entrepriseDetails.nomE);
      formData.append('email', entrepriseDetails.email);
      formData.append('matriculeE', entrepriseDetails.matriculeE);
      formData.append('villeE', entrepriseDetails.villeE);
      formData.append('adresseE', entrepriseDetails.adresseE);
      
      if (entrepriseDetails.lien_facebook_E) {
          formData.append('lien_facebook_E', entrepriseDetails.lien_facebook_E);
      }
      
      if (entrepriseDetails.lien_site_E) {
          formData.append('lien_site_E', entrepriseDetails.lien_site_E);
      }

      if (entrepriseDetails.logoE instanceof File) {
          const logoResponse = await uploadLogo(entrepriseDetails.logoE);
          formData.append('logoE', logoResponse.path);
      } else if (entrepriseDetails.logoE) {
          formData.append('logoE', entrepriseDetails.logoE);
      }

      const response = await updateEntrepriseProfile(formData);
      
      // Mise à jour des détails avec la réponse
      if (response.user) {
          setEntrepriseDetails(prev => ({
              ...prev,
              ...response.user
          }));
          setUpdateStatus({
              type: 'success',
              message: 'Profile updated successfully!'
          });
      }
  } catch (err) {
      setError(err.message);
      setUpdateStatus({
          type: 'error',
          message: err.message
      });
  } finally {
      setIsSubmitting(false);
  }
};
  //v1.0
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   setError(null);

  //   try {
  //     const formData = new FormData();
  //     formData.append('nomE', entrepriseDetails.nomE);
  //     formData.append('email', entrepriseDetails.email);
  //     formData.append('matriculeE', entrepriseDetails.matriculeE);
  //     formData.append('villeE', entrepriseDetails.villeE);
  //     formData.append('adresseE', entrepriseDetails.adresseE);
      
  //     if (entrepriseDetails.lien_facebook_E) {
  //       formData.append('lien_facebook_E', entrepriseDetails.lien_facebook_E);
  //     }
      
  //     if (entrepriseDetails.lien_site_E) {
  //       formData.append('lien_site_E', entrepriseDetails.lien_site_E);
  //     }

  //     if (entrepriseDetails.logoE instanceof File) {
  //       const logoResponse = await uploadLogo(entrepriseDetails.logoE);
  //       formData.append('logoE', logoResponse.path);
  //     } else if (entrepriseDetails.logoE) {
  //       formData.append('logoE', entrepriseDetails.logoE);
  //     }

  //     const response = await updateEntrepriseProfile(formData);
  //     if (response.user) {
  //       setEntrepriseDetails(response.user);
  //       setUpdateStatus({
  //         type: 'success',
  //         message: 'Profile updated successfully!'
  //       });
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //     setUpdateStatus({
  //       type: 'error',
  //       message: err.message
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="index-2.html" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Settings</li>
        </ol>
      </div>
      <div className="app-body">
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
                      <div className="mb-3">
                        <label htmlFor="nomE" className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="nomE"
                          name="nomE"
                          value={entrepriseDetails.nomE}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={entrepriseDetails.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="matriculeE" className="form-label">Matricule</label>
                        <input
                          type="text"
                          className="form-control"
                          id="matriculeE"
                          name="matriculeE"
                          value={entrepriseDetails.matriculeE}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <label htmlFor="villeE" className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          id="villeE"
                          name="villeE"
                          value={entrepriseDetails.villeE}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="logoE" className="form-label">Company Logo</label>
                        {entrepriseDetails.logoE && (
                          <div className="mb-2">
                            <img
                              src={getImageUrl(entrepriseDetails.logoE)}
                              alt="Company Logo"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          id="logoE"
                          name="logoE"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
                      Reset
                    </button>
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingEn;
//v1.0
// import React, { useEffect, useState } from 'react';
// import { getUserProfile, updateEntrepriseProfile } from '../../../services/authService';
// import { uploadLogo, getImageUrl } from '../../../services/imageService';

// function SettingEn() {
//   const [entrepriseDetails, setEntrepriseDetails] = useState({
//     nomE: '',
//     email: '',
//     matriculeE: '',
//     villeE: '',
//     adresseE: '',
//     lien_facebook_E: '',
//     lien_site_E: '',
//     logoE: '',
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchEntrepriseDetails = async () => {
//       try {
//         const { user } = await getUserProfile();
//         // Remplacer les valeurs undefined par des chaînes vides
//         const sanitizedUser = {
//           nomE: user.nomE || '',
//           email: user.email || '',
//           matriculeE: user.matriculeE || '',
//           villeE: user.villeE || '',
//           adresseE: user.adresseE || '',
//           lien_facebook_E: user.lien_facebook_E || '',
//           lien_site_E: user.lien_site_E || '',
//           logoE: user.logoE || null,
//         };
//         setEntrepriseDetails(sanitizedUser);
//       } catch (err) {
//         setError('Failed to load entreprise details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEntrepriseDetails();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEntrepriseDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setEntrepriseDetails((prev) => ({ ...prev, logoE: file }));
//   };


//   //v1.0
//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       setIsSubmitting(true);
//       setError(null);

//       try {
//           const formData = new FormData();

//           // Ajouter les champs requis
//           formData.append('nomE', entrepriseDetails.nomE);
//           formData.append('email', entrepriseDetails.email);
//           formData.append('matriculeE', entrepriseDetails.matriculeE);
//           formData.append('villeE', entrepriseDetails.villeE);
//           formData.append('adresseE', entrepriseDetails.adresseE);

//           // Ajouter les champs optionnels
//           if (entrepriseDetails.lien_facebook_E) {
//               formData.append('lien_facebook_E', entrepriseDetails.lien_facebook_E);
//           }
//           if (entrepriseDetails.lien_site_E) {
//               formData.append('lien_site_E', entrepriseDetails.lien_site_E);
//           }

//           // Gérer le logo
//           if (entrepriseDetails.logoE instanceof File) {
//               formData.append('logoE', entrepriseDetails.logoE);
//           }

//           console.log('Sending update with data:', Object.fromEntries(formData));
//           const response = await updateEntrepriseProfile(formData);

//           if (response.entreprise) {
//               setEntrepriseDetails(response.entreprise);
//               setUpdateStatus({
//                   type: 'success',
//                   message: 'Profile updated successfully!'
//               });

//               // Rafraîchir les données
//               const { user } = await getUserProfile();
//               setEntrepriseDetails(user);
//           }
//       } catch (err) {
//           console.error('Update Error:', err);
//           setError(err.message);
//           setUpdateStatus({
//               type: 'danger',
//               message: err.message
//           });
//       } finally {
//           setIsSubmitting(false);
//       }
//   };

//   // Add visual feedback

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }
// //console.log('Sending update with data:', Object.fromEntries(formData));
//   return (
//     <div>
//       <div className="app-hero-header d-flex align-items-start">
//         {/* Breadcrumb start */}
//         <ol className="breadcrumb">
//           <li className="breadcrumb-item">
//             <i className="bi bi-house lh-1"></i>
//             <a href="index-2.html" className="text-decoration-none">Home</a>
//           </li>
//           <li className="breadcrumb-item" aria-current="page">Settings</li>
//         </ol>
//       </div>
//       <div className="app-body">
//         {/* Row start */}
//         <div className="row gx-3">
//           <div className="col-xxl-12">
//             <div className="card mb-3">
//               <div className="card-body">
//                 <form onSubmit={handleSubmit}>
//                   {updateStatus && (
//                     <div className={`alert alert-${updateStatus.type} mb-3`}>
//                       {updateStatus.message}
//                     </div>
//                   )}
//                   <div className="row gx-3">
//                     <div className="col-6">
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="nomE" className="form-label">Company Name</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           id="nomE"
//                           name="nomE"
//                           value={entrepriseDetails.nomE}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="email" className="form-label">Email</label>
//                         <input
//                           type="email"
//                           className="form-control"
//                           id="email"
//                           name="email"
//                           value={entrepriseDetails.email}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="matriculeE" className="form-label">Matricule</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           id="matriculeE"
//                           name="matriculeE"
//                           value={entrepriseDetails.matriculeE}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div className="col-6">
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="villeE" className="form-label">City</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           id="villeE"
//                           name="villeE"
//                           value={entrepriseDetails.villeE}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="adresseE" className="form-label">Address</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           id="adresseE"
//                           name="adresseE"
//                           value={entrepriseDetails.adresseE}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="lien_facebook_E" className="form-label">Facebook Link</label>
//                         <input
//                           type="url"
//                           className="form-control"
//                           id="lien_facebook_E"
//                           name="lien_facebook_E"
//                           value={entrepriseDetails.lien_facebook_E}
//                           onChange={handleChange}
//                         />
//                       </div>
//                       {/* Form Field Start */}
//                       <div className="mb-3">
//                         <label htmlFor="imageU" className="form-label">Profile Picture</label>
//                         {entrepriseDetails.logoE && (
//                           <div className="mb-2">
//                             <img
//                               src={getImageUrl(entrepriseDetails.logoE)}
//                               alt="Profile"
//                               style={{ width: '100px', height: '100px', objectFit: 'cover' }}
//                             />
//                           </div>
//                         )}
//                         <input
//                           type="file"
//                           className="form-control"
//                           id="logoE"
//                           name="logoE"
//                           accept="image/*"
//                           onChange={handleFileChange}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   {/* Submit Button */}
//                   <div className="d-flex gap-2 justify-content-end">
//                     <button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
//                       Reset
//                     </button>
//                     <button type="submit" className="btn btn-success">
//                       Update
//                     </button>
//                     {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
//                     {error && <div className="alert alert-danger mt-3">{error}</div>}
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* Row end */}
//       </div>
//     </div>
//   );
// }

// export default SettingEn;