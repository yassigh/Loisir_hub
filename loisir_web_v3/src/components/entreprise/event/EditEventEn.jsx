import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import { getEventById, updateEvent } from '../../../services/eventService';
import { getImagesForEntity, uploadImageForEntity, deleteImage, getLoisirImageUrl } from '../../../services/imageService';


const EditEventEn = () => {
  const { id } = useParams();
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
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Liste des régions de Tunisie
  const regions = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const event = await getEventById(id);
        setFormData({
          nomEvent: event.nomEvent,
          descriptionEvent: event.descriptionEvent,
          lieuEvent: event.lieuEvent,
          regionEvent: event.regionEvent,
          typeEvent: event.typeEvent,
          date_debutEvent: event.date_debutEvent.substr(0, 10), // Format YYYY-MM-DD
          date_finEvent: event.date_finEvent.substr(0, 10),
          categorie_id: event.categorie_id
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to fetch event data');
      }
    };

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
    fetchEvent();
  }, [id]);
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const eventImages = await getImagesForEntity('evenements', id);
        setImages(eventImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      }
    };

    if (id) {
      fetchImages();
    }
  }, [id]);

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
      await updateEvent(id, formData);
      toast.success('Event updated successfully');
      navigate('/enterprise/eventsEn');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImageForEntity(selectedFile, 'evenements', id);
      const newImage = result.image;
      setImages(prevImages => [...prevImages, newImage]);
      toast.success('Image uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId);
        setImages(images.filter(img => img.id !== imageId));
        toast.success('Image deleted successfully');
      } catch (error) {
        toast.error('Failed to delete image');
      }
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
          <li className="breadcrumb-item" aria-current="page">Edit Event</li>
        </ol>

      </div>
      <h3 className="mb-4">Edit Event</h3>
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
              <i className="bi bi-hourglass-split me-1"></i> Updating...
            </span>
          ) : (
            <span>
              <i className="bi bi-save me-1"></i> Update Event
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
      <div className="mt-5">
        <h4>Event Images</h4>

        {/* Image Upload Section */}
        <div className="mb-4">
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              onChange={handleFileSelect}
              accept="image/*"
            />
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>

        {/* Images Gallery */}
        <div className="row">
          {images.map((image) => (
            <div key={image.id} className="col-md-4 mb-3">
              <div className="card">
                <img
                  src={getLoisirImageUrl(image.url)}
                  className="card-img-top"
                  alt="Event"
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Image loading error:', e);
                    console.log('Image URL:', getLoisirImageUrl(image.url));
                  }}
                />
                <div className="card-body">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <i className="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="alert alert-info">
            No images uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default EditEventEn;