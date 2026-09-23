import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateCategory, getCategoryById } from '../../../services/categoryService';

const EditCategoryAd = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState({
    nomCat: '',
    descriptionCat: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Charger les détails de la catégorie
    const loadCategory = async () => {
      try {
        const response = await getCategoryById(id);
        setCategory(response.categorie); // Ajustez selon la structure de votre réponse API
      } catch (error) {
        console.error('Failed to load category:', error);
        alert('Failed to load category details');
        navigate('/admin/categoriesAd');
      }
    };
    loadCategory();

    // Initialiser les icônes Lucide après le rendu du composant
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }, [id, navigate]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCategory(id, category);
      alert('Category updated successfully');
      navigate('/admin/categoriesAd'); // Redirection vers la liste des catégories
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category');
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
  
  }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{ 
    color: '#4a7c87', 
  
  }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Categories</li>
          <li className="breadcrumb-item active" aria-current="page">Edit Category</li>
        </ol>

        {/* Bouton Cancel */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/admin/categoriesAd')}
        >
          <i className="bi bi-x-circle me-1"></i> Cancel
        </button>
      </div>

      {/* Form Section */}
      <div className="row gx-3 mt-4">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Edit Category</h5>
              <form onSubmit={handleSubmit}>
                {/* Nom de la catégorie */}
                <div className="mb-3">
                  <label htmlFor="nomCat" className="form-label">
                    Category Name
                  </label>
                  <input
                    type="text"
                    className="form-control w-100"
                    id="nomCat"
                    placeholder="Enter category name"
                    value={category.nomCat}
                    onChange={(e) =>
                      setCategory({ ...category, nomCat: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description de la catégorie */}
                <div className="mb-3">
                  <label htmlFor="descriptionCat" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control w-100"
                    id="descriptionCat"
                    rows="3"
                    placeholder="Enter category description"
                    value={category.descriptionCat}
                    onChange={(e) =>
                      setCategory({ ...category, descriptionCat: e.target.value })
                    }
                  ></textarea>
                </div>

                {/* Boutons de soumission et annulation */}
                <div className="d-flex gap-2">
                  <button 
                  style={{ 
                    backgroundColor: '#4a7c87',
                  
                  
                  }}
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>
                        <i className="bi bi-hourglass-split me-1"></i> Saving...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-save me-1"></i> Save Changes
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

export default EditCategoryAd;