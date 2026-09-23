import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getImagesForEntity, getLoisirImageUrl } from '../../../services/imageService';
import { getActivityById } from '../../../services/activityService';
import { getEventById } from '../../../services/eventService';
import { getPostById } from '../../../services/postService';
import { getAdvertisementById } from '../../../services/advetisementService';
import PropTypes from 'prop-types';

const InfoPageAd = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let result;
        switch (type) {
          case 'activity':
            result = await getActivityById(id);
            break;
          case 'event':
            result = await getEventById(id);
            break;
          case 'post':
            result = await getPostById(id);
            break;
          case 'advertisement':
            result = await getAdvertisementById(id);
            break;
          default:
            throw new Error('Invalid type');
        }
        setData(result);

        // Map entity types to API endpoints
        const entityType = {
          'activity': 'activites-payantes',
          'event': 'evenements',
          'post': 'postes',
          'advertisement': 'publicites'
        }[type];

        const imagesList = await getImagesForEntity(entityType, id);
        setImages(imagesList || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (!data) return <div className="text-center p-5">No data found</div>;

  const renderDetails = () => {
    switch (type) {
      case 'activity':
        return (

          <div className="details">
            <h3>{data.nomActP}</h3>
            <p><strong>Description:</strong> {data.descriptionP}</p>
            <p><strong>Location:</strong> {data.lieuP}</p>
            <p><strong>Region:</strong> {data.regionP}</p>
            <p><strong>Price:</strong> {data.prixP} TND</p>
            <p><strong>Duration:</strong>
              {data.jours ? `${data.jours} days ` : ''}
              {data.heure ? `${data.heure}h ` : ''}
              {data.minute ? `${data.minute}min` : ''}
            </p>
            <p><strong>Offer:</strong> {data.offreP}</p>
            <p><strong>Status:</strong> {data.status}</p>
          </div>
        );
      case 'event':
        return (
          <div className="details">
            <h3>{data.nomEvent}</h3>
            <p><strong>Description:</strong> {data.descriptionEvent}</p>
            <p><strong>Location:</strong> {data.lieuEvent}</p>
            <p><strong>Region:</strong> {data.regionEvent}</p>
            <p><strong>Start Date:</strong> {data.date_debutEvent}</p>
            <p><strong>End Date:</strong> {data.date_finEvent}</p>
            <p><strong>Type:</strong> {data.typeEvent}</p>
            <p><strong>Status:</strong> {data.status}</p>
          </div>
        );
      case 'post':
        return (
          <div className="details">
            <h3>{data.nomPoste}</h3>
            <p><strong>Description:</strong> {data.descriptionPoste}</p>
            <p><strong>Location:</strong> {data.lieuPoste}</p>
            <p><strong>Region:</strong> {data.regionPoste}</p>
            <p><strong>Type:</strong> {data.typePoste}</p>
            <p><strong>Status:</strong> {data.status}</p>
          </div>
        );
      case 'advertisement':
        return (
          <div className="details">
            <h3>Advertisement #{data.id}</h3>
            <p><strong>Start Date:</strong> {data.date_debut}</p>
            <p><strong>Duration:</strong> {data.nbJours} days</p>
            <p><strong>Daily Cost:</strong> {data.montantAPayerParJour} TND</p>
            <p><strong>Total Cost:</strong> {data.montantAPayer} TND</p>
            <p><strong>Status:</strong> {data.statut}</p>
            <p><strong>Payment Status:</strong> {data.payment_status}</p>
          </div>
        );
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">

        {/* Breadcrumb start */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{
              color: '#4A7C87',

            }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{
              color: '#4A7C87',

            }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Details</li>
        </ol>
        {/* Breadcrumb end */}

        {/* Sales stats start */}

        {/* Sales stats end */}

      </div>
      <div className="container my-5">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                {images.length > 0 ? (
                  <Carousel>
                    {images.map((image, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={getLoisirImageUrl(image.url)}
                          alt={`Slide ${index + 1}`}
                          style={{ height: '400px', objectFit: 'cover' }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="text-center p-5 bg-light">
                    No images available
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {renderDetails()}
              </div>
            </div>
            <button
              className="btn btn-secondary mt-3"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};
InfoPageAd.propTypes = {
  type: PropTypes.oneOf(['activity', 'event', 'post', 'advertisement']).isRequired
};


export default InfoPageAd;