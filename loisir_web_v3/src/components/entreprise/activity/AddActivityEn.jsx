import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { addActivity } from '../../../services/activityService';
import { getAllCategories } from '../../../services/categoryService';

const AddActivityEn = () => {
  const [formData, setFormData] = useState({
    nomActP: '',
    descriptionP: '',
    lieuP: '',
    regionP: '',
    prixP: '',
    offreP: '',
    categorie_id: '',
    heure: '0',
    minute: '0',
    jour: '0'
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const regions = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const activityData = {
        ...formData,
        prixP: `${formData.prixP}`,
        heure: parseInt(formData.heure) || 0,
        minute: parseInt(formData.minute) || 0,
        jours: parseInt(formData.jour) || 0
      };
      const response = await addActivity(activityData);
      if (response && response.id) {
        toast.success('Activity added successfully');
        navigate(`/enterprise/manage-images/activites-payantes/${response.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <h3 className="mb-4">Add New Activity</h3>
      <form onSubmit={handleSubmit}>
        {/* Nom de l'activité */}
        <div className="mb-3">
          <label htmlFor="nomActP" className="form-label">
            Activity Name
          </label>
          <input
            type="text"
            className="form-control"
            id="nomActP"
            name="nomActP"
            placeholder="Enter activity name"
            value={formData.nomActP}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="descriptionP" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="descriptionP"
            name="descriptionP"
            rows="3"
            placeholder="Enter activity description"
            value={formData.descriptionP}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Lieu */}
        <div className="mb-3">
          <label htmlFor="lieuP" className="form-label">
            Location
          </label>
          <input
            type="text"
            className="form-control"
            id="lieuP"
            name="lieuP"
            placeholder="Enter location"
            value={formData.lieuP}
            onChange={handleChange}
            required
          />
        </div>

        {/* Région */}
        <div className="mb-3">
          <label htmlFor="regionP" className="form-label">
            Region
          </label>
          <select
            className="form-select"
            id="regionP"
            name="regionP"
            value={formData.regionP}
            onChange={handleChange}
            required
          >
            <option value="">Select a region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div className="mb-3">
          <label htmlFor="categorie_id" className="form-label">
            Category
          </label>
          <select
            className="form-select"
            id="categorie_id"
            name="categorie_id"
            value={formData.categorie_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nomCat}
              </option>
            ))}
          </select>
        </div>

        {/* Prix général */}
        <div className="mb-3">
          <label htmlFor="prixP" className="form-label">
            Price (TND)
          </label>
          <input
            type="number"
            className="form-control"
            id="prixP"
            name="prixP"
            placeholder="Enter price"
            value={formData.prixP || ''}
            onChange={handleChange}
            required
          />
        </div>

        {/* Durée */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="heure" className="form-label">Hours</label>
            <input
              type="number"
              className="form-control"
              id="heure"
              name="heure"
              placeholder="Hours"
              min="0"
              value={formData.heure}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="minute" className="form-label">Minutes</label>
            <input
              type="number"
              className="form-control"
              id="minute"
              name="minute"
              placeholder="Minutes"
              min="0"
              max="59"
              value={formData.minute}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="jour" className="form-label">Days</label>
            <input
              type="number"
              className="form-control"
              id="jour"
              name="jour"
              placeholder="Days"
              min="0"
              value={formData.jour}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Offre */}
        <div className="mb-3">
          <label htmlFor="offreP" className="form-label">
            Offer (Optional)
          </label>
          <input
            type="text"
            className="form-control"
            id="offreP"
            name="offreP"
            placeholder="Enter offer details"
            value={formData.offreP}
            onChange={handleChange}
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
              <i className="bi bi-plus-circle me-1"></i> Add Activity
            </span>
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary flex-grow-1"
          onClick={() => navigate('/enterprise/activitiesEn')}
        >
          <i className="bi bi-x-circle me-1"></i> Cancel
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddActivityEn;