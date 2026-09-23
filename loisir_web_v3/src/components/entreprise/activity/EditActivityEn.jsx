import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getActivityById, updateActivity } from '../../../services/activityService';
import { ToastContainer, toast } from 'react-toastify';
import { getAllCategories } from '../../../services/categoryService';
import { getImagesForEntity, uploadImageForEntity, deleteImage, getLoisirImageUrl } from '../../../services/imageService';

const EditActivityEn = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // État pour les données du formulaire
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

  // État pour les catégories et images
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Liste des régions
  const regions = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  // Charger les catégories
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

  // Charger les images pour l'activité
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const activityImages = await getImagesForEntity('activites-payantes', id);
        setImages(activityImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      }
    };
    if (id) {
      fetchImages();
    }
  }, [id]);

  // Charger les détails de l'activité
  useEffect(() => {
    console.log('Images:', images);
images.forEach(img => console.log('Image URL:', img.url));
    if (categories.length === 0) return;
    const fetchActivity = async () => {
      try {
        const activity = await getActivityById(id);
        setFormData({
          ...activity,
          heure: activity.heure || '0',
          minute: activity.minute || '0',
          jour: activity.jours || '0' // mapper jours vers jour
        });
      } catch (error) {
        console.error('Error fetching activity:', error);
        toast.error('Failed to fetch activity');
      }
    };
    fetchActivity();
  }, [id, categories]);

  // Gestion des modifications dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedPrice = `${formData.prixP}`;
      const activityData = {
        ...formData,
        prixP: formattedPrice,
        heure: parseInt(formData.heure) || 0,
        minute: parseInt(formData.minute) || 0,
        jours: parseInt(formData.jour) || 0 // mapper jour vers jours
      };
      await updateActivity(id, activityData);
      toast.success('Activity updated successfully');
      navigate('/enterprise/activitiesEn');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error(error.response?.data?.message || 'Failed to update activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion du téléchargement d'images
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
      const result = await uploadImageForEntity(selectedFile, 'activites-payantes', id);
      const newImage = result.image;
      setImages((prevImages) => [...prevImages, newImage]);
      toast.success('Image uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Gestion de la suppression d'images
  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId);
        setImages((images) => images.filter((img) => img.id !== imageId));
        toast.success('Image deleted successfully');
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start justify-content-between">
        {/* Breadcrumb */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="index-2.html" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Activities</li>
          <li className="breadcrumb-item" aria-current="page">Edit Activity</li>
        </ol>
      </div>

      <h3 className="mb-4">Edit Activity</h3>

      <form onSubmit={handleSubmit}>
        {/* Nom de l'activité */}
        <div className="mb-3">
          <label htmlFor="nomActP" className="form-label">Activity Name</label>
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
          <label htmlFor="descriptionP" className="form-label">Description</label>
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
          <label htmlFor="lieuP" className="form-label">Location</label>
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
          <label htmlFor="regionP" className="form-label">Region</label>
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
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div className="mb-3">
          <label htmlFor="categorie_id" className="form-label">Category</label>
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
              <option key={category.id} value={category.id}>{category.nomCat}</option>
            ))}
          </select>
        </div>

        {/* Prix général */}
        <div className="mb-3">
          <label htmlFor="prixP" className="form-label">Price (TND)</label>
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
          <label htmlFor="offreP" className="form-label">Offer (Optional)</label>
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

        {/* Section des images */}
        <div className="mt-5">
          <h4>Activity Images</h4>
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
          <div className="row">
          {images.map((image) => (
  <div key={image.id} className="col-md-4 mb-3">
    <div className="card">
      <img
        key={image.id}
        src={getLoisirImageUrl(image.url)}
        className="card-img-top"
        alt="Activity"
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
            <div className="alert alert-info">No images uploaded yet</div>
          )}
        </div>

        {/* Boutons de soumission */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span><i className="bi bi-hourglass-split me-1"></i> Updating...</span>
          ) : (
            <span><i className="bi bi-save me-1"></i> Update Activity</span>
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

export default EditActivityEn;