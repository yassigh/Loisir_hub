// src/components/enterprise/advertisement/AdListEn.jsx
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getEnterpriseAdvertisements, deleteAdvertisement, initiatePublicitePayment } from '../../../services/advetisementService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilterComponent from '../../admin/shared/FilterComponent';


const AdListEn = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [filteredAds, setFilteredAds] = useState([]);
  const [filters, setFilters] = useState({
    payment_status: '',
    status: '',
    dateRange: ''
  });

  const filterConfig = [
    {
      name: 'payment_status',
      label: 'Payment Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      name: 'dateRange',
      label: 'Date Range',
      options: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'all', label: 'All Time' }
      ]
    }
  ];

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    let result = [...advertisements];

    if (filters.payment_status) {
      result = result.filter(ad =>
        ad.payment_status === filters.payment_status
      );
    }

    if (filters.status) {
      result = result.filter(ad =>
        ad.statut === filters.status
      );
    }

    if (filters.dateRange) {
      const today = new Date();
      const adDate = (date) => new Date(date);

      switch (filters.dateRange) {
        case 'today':
          result = result.filter(ad => {
            const date = adDate(ad.date_debut);
            return date.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          result = result.filter(ad => {
            const date = adDate(ad.date_debut);
            return date >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          result = result.filter(ad => {
            const date = adDate(ad.date_debut);
            return date >= monthAgo;
          });
          break;
      }
    }

    setFilteredAds(result);
  };

  // Update loadAdvertisements
  const loadAdvertisements = async () => {
    setIsLoading(true);
    try {
      const data = await getEnterpriseAdvertisements();
      if (data) {
        setAdvertisements(data);
        setFilteredAds(data);
      }
    } catch (error) {
      console.error('Error loading advertisements:', error);
      toast.error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadAdvertisements();
  }, []);

  // Add effect for filters
  useEffect(() => {
    applyFilters();
  }, [advertisements, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      await deleteAdvertisement(id);
      toast.success('Advertisement deleted successfully');
      loadAdvertisements(); // Recharger la liste après suppression
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('Failed to delete advertisement');
    }
  };
  const handlePayment = async (id) => {
    try {
      const response = await initiatePublicitePayment(id);
      // Rediriger vers l'URL de paiement
      window.location.href = response.payment_url;
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
    }
  };

  const renderActionButtons = (advertisement) => {
    return (
      <td>
        <button
          className="btn btn-info btn-sm me-2"
          onClick={() => navigate(`/enterprise/advertisements/info/${advertisement.id}`)}
        >
          <i className="bi bi-info-lg"></i>
        </button>

        {advertisement.statut === 'approved' &&
          (advertisement.payment_status === 'pending' || advertisement.payment_status === 'failed') && (
            <button
              className="btn btn-success btn-sm me-2"
              onClick={() => handlePayment(advertisement.id)}
            >
              <i className="bi bi-credit-card"></i> Pay
            </button>
          )}

        <button
          className="btn btn-warning btn-sm me-2"
          onClick={() => navigate(`/enterprise/advertisement/edit/${advertisement.id}`)}
        >
          <i className="bi bi-pencil"></i>
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(advertisement.id)}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    );
  };

  return (
    <div style={{ marginLeft: '10px' }}>
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
          <li className="breadcrumb-item" aria-current="page">My Advertisements</li>
        </ol>

        <button style={{
          backgroundColor: '#4a7c87',


        }}
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/enterprise/advertisement/add')}
        >
          <i className="bi bi-plus-circle me-1"></i> Add New Advertisement
        </button>
        {/* Breadcrumb end */}

        {/* Sales stats start */}

        {/* Sales stats end */}

      </div>
      <FilterComponent
        filters={filterConfig}
        onFilterChange={handleFilterChange}
      />

      <div className="row gx-3">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle table-hover m-0">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">START DATE</th>
                      <th scope="col">DURATION (Days)</th>
                      <th scope="col">TOTAL AMOUNT</th>
                      <th scope="col">PAYMENT STATUS</th>
                      <th scope="col">STATUS</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredAds) && filteredAds.length > 0 ? (
                      filteredAds.map((advertisement) => (
                        <tr key={advertisement.id}>
                          <td>{advertisement.id}</td>
                          <td>{advertisement.date_debut}</td>
                          <td>{advertisement.nbJours}</td>
                          <td>{advertisement.montantAPayer}</td>
                          <td>
                            {advertisement.payment_status === 'pending' && (
                              <span className="badge border border-warning text-warning">Pending</span>
                            )}
                            {advertisement.payment_status === 'paid' && (
                              <span className="badge border border-success text-success">Paid</span>
                            )}
                            {advertisement.payment_status === 'failed' && (
                              <span className="badge border border-danger text-danger">Failed</span>
                            )}
                          </td>
                          <td>
                            {advertisement.statut === 'approved' && (
                              <span className="badge border border-success text-success">Approved</span>
                            )}
                            {advertisement.statut === 'pending' && (
                              <span className="badge border border-warning text-warning">Pending</span>
                            )}
                            {advertisement.statut === 'rejected' && (
                              <span className="badge border border-danger text-danger">Rejected</span>
                            )}
                          </td>
                          {renderActionButtons(advertisement)}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No advertisements found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdListEn;