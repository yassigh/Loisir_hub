import React, { useEffect, useState } from 'react';
import { getAllUsers,updateUserRole } from '../../../services/authService';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const UsersAd = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roleStyles = {
    admin: {
      backgroundColor: '#4F46E5',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      cursor: 'pointer',
      border: 'none',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease'
    },
    user: {
      backgroundColor: '#10B981',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      cursor: 'pointer',
      border: 'none',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease'
    }
  };

  // Fonction pour basculer le rôle
  const toggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'user' ? 'admin' : 'user';
      const response = await updateUserRole(userId, newRole);
      
      // Mettre à jour l'état local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Afficher une notification de succès (optionnel)
      alert(`Rôle mis à jour avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      alert('Erreur lors de la mise à jour du rôle');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        console.log('Auth token:', token); // Vérifiez si le token est présent
  
        const data = await getAllUsers();
        console.log('Fetched users:', data); // Vérifiez la réponse de l'API
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="index-2.html" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Users</li>
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
                      <th scope="col">First Name</th>
                      <th scope="col">Last Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.first_name}</td>
                          <td>{user.last_name}</td>
                          <td>{user.email}</td>
                          <td>{user.numTelU || 'Not provided'}</td>
                          {/* <td>{user.role}</td> */}
                          <td>
                            <button
                              onClick={() => toggleRole(user.id, user.role)}
                              style={roleStyles[user.role]}
                            >
                              {user.role}
                            </button>
                          </td>
                          <td>
                            {user.is_active ? (
                              <span className="badge border border-success text-success">Active</span>
                            ) : (
                              <span className="badge border border-danger text-danger">Inactive</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No users found</td>
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

export default UsersAd;