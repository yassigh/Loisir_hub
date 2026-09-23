import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, updatePost } from '../../../services/postService';
import { getAllCategories } from '../../../services/categoryService';
import { getImagesForEntity, uploadImageForEntity, deleteImage, getLoisirImageUrl } from '../../../services/imageService';


const EditPostEn = () => {
  const { id } = useParams(); // Récupère l'ID du poste depuis l'URL
  const navigate = useNavigate();
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
    const fetchImages = async () => {
      try {
        const postImages = await getImagesForEntity('postes', id);
        setImages(postImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      }
    };
  
    if (id) {
      fetchImages();
    }
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await getPostById(id);
        setFormData({
          nomPoste: post.nomPoste,
          descriptionPoste: post.descriptionPoste,
          lieuPoste: post.lieuPoste,
          regionPoste: post.regionPoste,
          typePoste: post.typePoste,
          categorie_id: post.categorie_id
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to fetch post data');
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
    fetchPost();
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
      await updatePost(id, formData); // Met à jour le poste avec l'ID et les nouvelles données
      toast.success('Post updated successfully');
      navigate('/enterprise/postsEn'); // Redirige vers la liste des postes
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error.response?.data?.message || 'Failed to update post');
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
      const result = await uploadImageForEntity(selectedFile, 'postes', id);
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
          <li className="breadcrumb-item" aria-current="page">Publications</li>
          <li className="breadcrumb-item" aria-current="page">Edit Publication</li>
        </ol>

      </div>
      <h3 className="mb-4">Edit Publication</h3>
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
              <i className="bi bi-hourglass-split me-1"></i> Updating...
            </span>
          ) : (
            <span>
              <i className="bi bi-save me-1"></i> Update Post
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
      <div className="mt-5">
              <h4>Publication Images</h4>
      
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
                        alt="PUblication"
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

export default EditPostEn;