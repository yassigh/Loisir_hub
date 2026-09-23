import React, { useState, useEffect } from 'react';
import { getAllCentres, addCentre, updateCentre, deleteCentre } from '../../../services/centreService';
import { ToastContainer, toast } from 'react-toastify';
import { authApi } from '../../../services/api';
const CentreInteretAd = () => {
  const [centres, setCentres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ nom: '', description: '', image: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCentres();
  }, []);

  const loadCentres = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCentres();
      setCentres(data);
    } catch (error) {
      toast.error('Failed to load centres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append('nom', formData.nom);
  form.append('description', formData.description);
  // N'ajoute l'image que si elle est sélectionnée
  if (formData.image) form.append('image', formData.image);

  try {
    if (isEditing) {
      await updateCentre(editingId, form);
      toast.success('Centre updated successfully');
    } else {
      await addCentre(form);
      toast.success('Centre added successfully');
    }
    setFormData({ nom: '', description: '', image: null });
    setIsEditing(false);
    setEditingId(null);
    loadCentres();
  } catch (error) {
    console.error('Error:', error.response?.data || error);
    toast.error('Failed to save centre');
  }
};

  
const handleEdit = (centre) => {
  setFormData({ nom: centre.nom, description: centre.description, image: null });
  setIsEditing(true);
  setEditingId(centre.id);
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this centre?')) {
      try {
        await deleteCentre(id);
        toast.success('Centre deleted successfully');
        loadCentres();
      } catch (error) {
        toast.error('Failed to delete centre');
      }
    }
  };
const updateCentre = async (id, centreData) => {
  try {
    centreData.append('_method', 'PUT'); // <-- Ajoute cette ligne
    const response = await authApi.post(`/centres-interet/${id}`, centreData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start justify-content-between">
        <h5>Manage Centres d'Intérêt</h5>
      </div>
      <div className="row gx-3">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nom" className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    name="image"
                    onChange={handleFileChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Centre' : 'Add Centre'}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centres.map((centre) => (
                      <tr key={centre.id}>
                        <td>{centre.nom}</td>
                        <td>{centre.description}</td>
                        <td>
  {centre.image && (
    <img src={centre.image} alt={centre.nom} style={{ width: '50px', height: '50px' }} />
  )}
</td>
                        <td>
                          <button className="btn btn-info btn-sm" onClick={() => handleEdit(centre)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(centre.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CentreInteretAd;