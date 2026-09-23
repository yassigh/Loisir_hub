import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import { addEvent } from '../../../services/eventService';

const AddEventEn = () => {
  const [formData, setFormData] = useState({
    nomEvent: '',
    descriptionEvent: '',
    lieuEvent: '',
    regionEvent: '',
    typeEvent: '',
    date_debutEvent: '',
    date_finEvent: '',
    categorie_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Liste des régions de Tunisie
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
        toast.error('Failed to load categories');
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
      const response = await addEvent(formData);
      console.log('Event creation response:', response);
  
      if (response && response.id) {
        toast.success('Event added successfully');
        navigate(`/enterprise/manage-images/evenements/${response.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event. Please try again.');
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
          <li className="breadcrumb-item" aria-current="page">Events</li>
          <li className="breadcrumb-item" aria-current="page">Add New Event</li>
        </ol>

      </div>
      <h3 className="mb-4">Add New Event</h3>
      <form onSubmit={handleSubmit}>
        {/* Nom de l'événement */}
        <div className="mb-3">
          <label htmlFor="nomEvent" className="form-label">
            Event Name
          </label>
          <input
            type="text"
            className="form-control"
            id="nomEvent"
            name="nomEvent"
            placeholder="Enter event name"
            value={formData.nomEvent}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="descriptionEvent" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="descriptionEvent"
            name="descriptionEvent"
            rows="3"
            placeholder="Enter event description"
            value={formData.descriptionEvent}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Lieu */}
        <div className="mb-3">
          <label htmlFor="lieuEvent" className="form-label">
            Location
          </label>
          <input
            type="text"
            className="form-control"
            id="lieuEvent"
            name="lieuEvent"
            placeholder="Enter location"
            value={formData.lieuEvent}
            onChange={handleChange}
            required
          />
        </div>

        {/* Région */}
        <div className="mb-3">
          <label htmlFor="regionEvent" className="form-label">
            Region
          </label>
          <select
            className="form-select"
            id="regionEvent"
            name="regionEvent"
            value={formData.regionEvent}
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

        {/* Type d'événement */}
        <div className="mb-3">
          <label htmlFor="typeEvent" className="form-label">
            Event Type
          </label>
          <input
            type="text"
            className="form-control"
            id="typeEvent"
            name="typeEvent"
            placeholder="Enter event type"
            value={formData.typeEvent}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date de début */}
        <div className="mb-3">
          <label htmlFor="date_debutEvent" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            id="date_debutEvent"
            name="date_debutEvent"
            value={formData.date_debutEvent}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date de fin */}
        <div className="mb-3">
          <label htmlFor="date_finEvent" className="form-label">
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            id="date_finEvent"
            name="date_finEvent"
            value={formData.date_finEvent}
            onChange={handleChange}
            required
          />
        </div>

        {/* Boutons de soumission */}
        <button
          type="submit"
          className="btn btn-primary me-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>
              <i className="bi bi-hourglass-split me-1"></i> Adding...
            </span>
          ) : (
            <span>
              <i className="bi bi-plus-circle me-1"></i> Add Event
            </span>
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/enterprise/eventsEn')}
        >
          <i className="bi bi-x-circle me-1"></i> Cancel
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddEventEn;