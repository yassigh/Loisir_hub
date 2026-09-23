import React, { useEffect, useState } from 'react';
import { getAllEntreprises } from '../../../services/authService';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const EntreprisesAd = () => {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntreprises = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        console.log('Auth token:', token); // Vérifiez si le token est présent
  
        const data = await getAllEntreprises();
        console.log('Fetched entreprises:', data); // Vérifiez la réponse de l'API
        setEntreprises(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching entreprises:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEntreprises();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ marginLeft: '10px' }}>
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
          <li className="breadcrumb-item" aria-current="page">Entreprises</li>
        </ol>
      </div>
      <div className="row gx-3">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle table-hover m-0">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Matricule</th>
                      <th scope="col">City</th>
                      <th scope="col">Facebook Link</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(entreprises) && entreprises.length > 0 ? (
                      entreprises.map((entreprise) => (
                        <tr key={entreprise.id}>
                          <td>{entreprise.id}</td>
                          <td>{entreprise.nomE}</td>
                          <td>{entreprise.email}</td>
                          <td>{entreprise.matriculeE}</td>
                          <td>{entreprise.villeE}</td>
                          <td>
                            <a href={entreprise.lien_facebook_E} target="_blank" rel="noopener noreferrer">
                              {entreprise.lien_facebook_E || 'Not provided'}
                            </a>
                          </td>
                          <td>
                            {entreprise.is_active ? (
                              <span className="badge border border-success text-success">Active</span>
                            ) : (
                              <span className="badge border border-danger text-danger">Inactive</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No entreprises found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntreprisesAd;