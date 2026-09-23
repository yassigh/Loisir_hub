import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { addPost } from '../../../services/postService';
import { getAllCategories } from '../../../services/categoryService';

const AddPostEn = () => {
  const [formData, setFormData] = useState({
    nomPoste: '',
    descriptionPoste: '',
    lieuPoste: '',
    regionPoste: '',
    typePoste: '',
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
      const response = await addPost(formData);
      console.log('Post creation response:', response);
  
      if (response && response.id) {
        toast.success('Post added successfully');
        navigate(`/enterprise/manage-images/postes/${response.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding post:', error);
      toast.error('Failed to add post. Please try again.');
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
          <li className="breadcrumb-item" aria-current="page">Publications</li>
          <li className="breadcrumb-item" aria-current="page">Add New Publication</li>
        </ol>

      </div>
      <h3 className="mb-4">Add New Post</h3>
      <form onSubmit={handleSubmit}>
        {/* Nom du poste */}
        <div className="mb-3">
          <label htmlFor="nomPoste" className="form-label">
            Post Name
          </label>
          <input
            type="text"
            className="form-control"
            id="nomPoste"
            name="nomPoste"
            placeholder="Enter post name"
            value={formData.nomPoste}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="descriptionPoste" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="descriptionPoste"
            name="descriptionPoste"
            rows="3"
            placeholder="Enter post description"
            value={formData.descriptionPoste}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Lieu */}
        <div className="mb-3">
          <label htmlFor="lieuPoste" className="form-label">
            Location
          </label>
          <input
            type="text"
            className="form-control"
            id="lieuPoste"
            name="lieuPoste"
            placeholder="Enter location"
            value={formData.lieuPoste}
            onChange={handleChange}
            required
          />
        </div>

        {/* Région */}
        <div className="mb-3">
          <label htmlFor="regionPoste" className="form-label">
            Region
          </label>
          <select
            className="form-select"
            id="regionPoste"
            name="regionPoste"
            value={formData.regionPoste}
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

        {/* Type de poste */}
        <div className="mb-3">
          <label htmlFor="typePoste" className="form-label">
            Post Type
          </label>
          <input
            type="text"
            className="form-control"
            id="typePoste"
            name="typePoste"
            placeholder="Enter post type"
            value={formData.typePoste}
            onChange={handleChange}
            required
          />
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
              <i className="bi bi-plus-circle me-1"></i> Add Post
            </span>
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/enterprise/postsEn')}
        >
          <i className="bi bi-x-circle me-1"></i> Cancel
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddPostEn;