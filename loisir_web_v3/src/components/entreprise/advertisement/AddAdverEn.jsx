// src/components/enterprise/advertisement/AddAdverEn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAdvertisement } from '../../../services/advetisementService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddAdverEn = () => {
  const [formData, setFormData] = useState({
    date_debut: '',
    nbJours: '',
    montantAPayerParJour: 1.0, // Valeur par défaut récupérée depuis la base de données ou fixée ici
    montantAPayer: '', // Montant calculé automatiquement
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mettre à jour l'état avec les nouvelles valeurs
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Si le champ modifié est "nbJours", recalculer le montant total
    if (name === 'nbJours') {
      const nbJours = parseFloat(value);
      const montantAPayerParJour = parseFloat(formData.montantAPayerParJour);

      if (!isNaN(nbJours) && !isNaN(montantAPayerParJour)) {
        const montantAPayer = nbJours * montantAPayerParJour;
        setFormData((prevData) => ({
          ...prevData,
          montantAPayer: montantAPayer.toFixed(2), // Arrondir à 2 décimales
        }));
      }
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données à envoyer
      const advertisementData = {
        date_debut: formData.date_debut,
        nbJours: parseInt(formData.nbJours),
        montantAPayer: parseFloat(formData.montantAPayer),
        montantAPayerParJour: parseFloat(formData.montantAPayerParJour),
      };

      // Appeler le service pour ajouter la publicité
      const response = await addAdvertisement(advertisementData);

      if (response && response.id) {
        toast.success('Advertisement added successfully');
        navigate(`/enterprise/manage-images/publicites/${response.id}`); // Redirection vers la page de gestion des images
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding advertisement:', error);
      toast.error('Failed to add advertisement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start justify-content-between">
        {/* Breadcrumb start */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="index-2.html" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Advertisements</li>
          <li className="breadcrumb-item" aria-current="page">Add New Advertisement</li>
        </ol>
        {/* Breadcrumb end */}
      </div>

      <h3 className="mb-4">Add New Advertisement</h3>

      <form onSubmit={handleSubmit}>
        {/* Date de début */}
        <div className="mb-3">
          <label htmlFor="date_debut" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            id="date_debut"
            name="date_debut"
            value={formData.date_debut}
            onChange={handleChange}
            required
          />
        </div>

        {/* Nombre de jours */}
        <div className="mb-3">
          <label htmlFor="nbJours" className="form-label">
            Number of Days
          </label>
          <input
            type="number"
            className="form-control"
            id="nbJours"
            name="nbJours"
            placeholder="Enter number of days"
            value={formData.nbJours}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        {/* Montant par jour */}
        <div className="mb-3">
          <label htmlFor="montantAPayerParJour" className="form-label">
            Amount per Day (TND)
          </label>
          <input
            type="number"
            className="form-control"
            id="montantAPayerParJour"
            name="montantAPayerParJour"
            placeholder="Enter amount per day"
            value={formData.montantAPayerParJour}
            onChange={handleChange}
            step="0.01"
            readOnly // Ce champ peut être en lecture seule si la valeur est fixe
          />
        </div>

        {/* Montant total calculé */}
        <div className="mb-3">
          <label htmlFor="montantAPayer" className="form-label">
            Total Amount (TND)
          </label>
          <input
            type="text"
            className="form-control"
            id="montantAPayer"
            name="montantAPayer"
            value={formData.montantAPayer || '0.00'}
            readOnly // Champ non modifiable
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>
              <i className="bi bi-hourglass-split me-1"></i> Adding...
            </span>
          ) : (
            <span>
              <i className="bi bi-plus-circle me-1"></i> Add Advertisement
            </span>
          )}
        </button>

        {/* Bouton Annuler */}
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate('/enterprise/advertisements')}
        >
          <i className="bi bi-x-circle me-1"></i> Cancel
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default AddAdverEn;