import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCategory } from '../../../services/categoryService';

const AddCategoryAd = () => {
  const [nomCat, setNomCat] = useState('');
  const [descriptionCat, setDescriptionCat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Appel à l'API pour ajouter la catégorie
      await addCategory({ nomCat, descriptionCat });
      alert('Category added successfully');
      navigate('/admin/categoriesAd'); // Redirection vers la liste des catégories
    } catch (error) {
      alert('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      {/* Header with Breadcrumb */}
      <div className="app-hero-header d-flex align-items-start justify-content-between">
        {/* Breadcrumb start */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{
              color: '#4a7c87',

            }} ></i>
            <a href="index-2.html" className="text-decoration-none" style={{
              color: '#4a7c87',

            }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Categories</li>
          <li className="breadcrumb-item active" aria-current="page">Add New Category</li>
        </ol>

      </div>

      {/* Form Section */}
      <div className="row gx-3 mt-4">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title" >Add New Category</h5>
              <form onSubmit={handleSubmit}>
                {/* Nom de la catégorie */}
                <div className="mb-3">
                  <label htmlFor="nomCat" className="form-label">
                    Category Name
                  </label>
                  <input
                    type="text"
                    className="form-control w-100" // Ajustement pour remplir la largeur
                    id="nomCat"
                    placeholder="Enter category name"
                    value={nomCat}
                    onChange={(e) => setNomCat(e.target.value)}
                    required
                  />
                </div>

                {/* Description de la catégorie */}
                <div className="mb-3">
                  <label htmlFor="descriptionCat" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control w-100" // Ajustement pour remplir la largeur
                    id="descriptionCat"
                    rows="3"
                    placeholder="Enter category description"
                    value={descriptionCat}
                    onChange={(e) => setDescriptionCat(e.target.value)}
                  ></textarea>
                </div>

                {/* Boutons de soumission et annulation */}
                <div className="d-flex gap-2">
                  <button style={{
                    backgroundColor: '#4a7c87',


                  }}
                    type="submit"
                    className="btn btn-success flex-grow-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>
                        <i className="bi bi-hourglass-split me-1"></i> Adding...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-plus-circle me-1"></i> Add Category
                      </span>
                    )}
                  </button>
                  <button style={{

                    backgroundColor: '#D7A738',

                  }}
                    type="button"
                    className="btn btn-secondary flex-grow-1"
                    onClick={() => navigate('/admin/categoriesAd')}
                  >
                    <i className="bi bi-x-circle me-1"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryAd;