import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdvertisementById, updateAdvertisement } from '../../../services/advetisementService';
import { getImagesForEntity, uploadImageForEntity, deleteImage, getLoisirImageUrl } from '../../../services/imageService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditAdverEn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date_debut: '',
    nbJours: '',
    montantAPayerParJour: 1.0,
    montantAPayer: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch advertisement data and images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const advertisement = await getAdvertisementById(id);
        const formattedDate = new Date(advertisement.date_debut).toISOString().split('T')[0];
        setFormData({
          date_debut: formattedDate,
          nbJours: advertisement.nbJours.toString(),
          montantAPayerParJour: advertisement.montantAPayerParJour,
          montantAPayer: advertisement.montantAPayer.toString(),
        });

        const advertisementImages = await getImagesForEntity('publicites', id);
        setImages(advertisementImages);
      } catch (error) {
        console.error('Error fetching advertisement:', error);
        toast.error('Failed to load advertisement data');
        navigate('/enterprise/advertisementsEn');
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'nbJours') {
      const nbJours = parseFloat(value);
      const montantAPayerParJour = parseFloat(formData.montantAPayerParJour);

      if (!isNaN(nbJours) && !isNaN(montantAPayerParJour)) {
        const montantAPayer = nbJours * montantAPayerParJour;
        setFormData((prevData) => ({
          ...prevData,
          montantAPayer: montantAPayer.toFixed(2),
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const advertisementData = {
        date_debut: formData.date_debut,
        nbJours: parseInt(formData.nbJours),
        montantAPayer: parseFloat(formData.montantAPayer),
        montantAPayerParJour: parseFloat(formData.montantAPayerParJour),
      };

      await updateAdvertisement(id, advertisementData);
      toast.success('Advertisement updated successfully');
      navigate('/enterprise/advertisementsEn');
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast.error('Failed to update advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
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
      const result = await uploadImageForEntity(selectedFile, 'publicites', id);
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

  // Handle image deletion
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
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="/" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item">Advertisements</li>
          <li className="breadcrumb-item">Edit Advertisement</li>
        </ol>
      </div>

      <h3 className="mb-4">Edit Advertisement</h3>

      <form onSubmit={handleSubmit}>
        {/* Start Date */}
        <div className="mb-3">
          <label htmlFor="date_debut" className="form-label">Start Date</label>
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

        {/* Number of Days */}
        <div className="mb-3">
          <label htmlFor="nbJours" className="form-label">Number of Days</label>
          <input
            type="number"
            className="form-control"
            id="nbJours"
            name="nbJours"
            value={formData.nbJours}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        {/* Amount per Day */}
        <div className="mb-3">
          <label htmlFor="montantAPayerParJour" className="form-label">
            Amount per Day (TND)
          </label>
          <input
            type="number"
            className="form-control"
            id="montantAPayerParJour"
            name="montantAPayerParJour"
            value={formData.montantAPayerParJour}
            onChange={handleChange}
            step="0.01"
            readOnly
          />
        </div>

        {/* Total Amount */}
        <div className="mb-3">
          <label htmlFor="montantAPayer" className="form-label">
            Total Amount (TND)
          </label>
          <input
            type="text"
            className="form-control"
            id="montantAPayer"
            name="montantAPayer"
            value={formData.montantAPayer}
            readOnly
          />
        </div>

        {/* Image Management Section */}
        <div className="mt-5">
          <h4>Advertisement Images</h4>

          <div className="mb-4">
            <div className="input-group">
              <input
                type="file"
                className="form-control"
                onChange={handleFileSelect}
                accept="image/*"
              />
              <button
                type="button"
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
                    src={getLoisirImageUrl(image.url)}
                    className="card-img-top"
                    alt="Advertisement"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <button
                      type="button"
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

        {/* Submit and Cancel Buttons */}
        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span><i className="bi bi-hourglass-split me-1"></i> Updating...</span>
            ) : (
              <span><i className="bi bi-save me-1"></i> Update Advertisement</span>
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate('/enterprise/advertisementsEn')}
          >
            <i className="bi bi-x-circle me-1"></i> Cancel
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default EditAdverEn;