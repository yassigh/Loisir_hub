import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { getImagesForEntity, uploadImageForEntity, deleteImage, getLoisirImageUrl } from '../../../services/imageService';

const ImageManagement = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Type mapping for navigation
  const typeMapping = {
    'activites-payantes': '/enterprise/activitiesEn',
    'evenements': '/enterprise/eventsEn',
    'postes': '/enterprise/postsEn',
    'publicites': '/enterprise/advertisementsEn'

  };
  const navigateBack = () => {
    switch (type) {
      case 'activites-payantes':
        navigate('/enterprise/activitiesEn');
        break;
      case 'evenements':
        navigate('/enterprise/eventsEn');
        break;
      case 'postes':
        navigate('/enterprise/postsEn');
        break;
      case 'publicites': // Add this case
        navigate('/enterprise/advertisementsEn');
        break;
      default:
        navigate('/enterprise');
    }
  };

  useEffect(() => {
    if (!id || id === 'undefined') {
      console.error('Invalid ID received:', id);
      toast.error('Invalid entity ID');
      navigateBack();
      return;
    }

    const fetchImages = async () => {
      try {
        const entityImages = await getImagesForEntity(type, id);
        console.log('Fetched images:', entityImages);
        setImages(entityImages || []);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
        navigateBack();
      }
    };

    fetchImages();
  }, [type, id]);

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
      const result = await uploadImageForEntity(selectedFile, type, id);
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

  const handleFinish = () => {
    navigate(typeMapping[type]);
  };

  return (
    <div className="container mt-4" style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start justify-content-between">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1"></i>
            <a href="/" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item">Manage Images</li>
        </ol>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">Manage Images</h3>

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
                    src={getLoisirImageUrl(image.url)}
                    className="card-img-top"
                    alt="Entity"
                    style={{ height: '200px', objectFit: 'cover' }}
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

          <div className="mt-4">
            <button
              className="btn btn-success"
              onClick={handleFinish}
            >
              <i className="bi bi-check-circle"></i> Finish
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ImageManagement;