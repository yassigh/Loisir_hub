// src/components/admin/advertisement/AdListAd.jsx
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAllAdvertisementsForAdmin, updateAdvertisementStatus } from '../../../services/advetisementService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilterComponent from '../shared/FilterComponent';
import { getAllEntreprises } from '../../../services/entrepriseService';


const AdListAd = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [filteredAds, setFilteredAds] = useState([]);
  const [entreprises, setEnterprises] = useState([]);
  const [filters, setFilters] = useState({
    entreprise: '',
    payment_status: '',
    status: ''
  });

  useEffect(() => {
    loadAdvertisements();
    applyFilters();
  }, [advertisements, filters]);

  //v2.0
  const loadAdvertisements = async () => {
    setIsLoading(true);
    try {
      const [adsData, entreprisesData] = await Promise.all([
        getAllAdvertisementsForAdmin(),
        getAllEntreprises()
      ]);

      setAdvertisements(adsData || []);
      setFilteredAds(adsData || []);
      setEnterprises(entreprisesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  //v1.0
  // const loadAdvertisements = async () => {
  //   setIsLoading(true);
  //   try {
  //     const data = await getAllAdvertisementsForAdmin();
  //     if (data) {
  //       setAdvertisements(data);
  //     }
  //   } catch (error) {
  //     console.error('Error loading advertisements:', error);
  //     toast.error('Failed to load advertisements');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAdvertisementStatus(id, status);
      toast.success(`Advertisement status updated to ${status} successfully`);
      loadAdvertisements();
    } catch (error) {
      console.error('Error updating advertisement status:', error);
      toast.error(error.error || 'Failed to update advertisement status');
    }
  };
  const filterConfig = [
    {
      name: 'entreprise',
      label: 'Enterprise',
      options: Array.isArray(entreprises) ? entreprises.map(ent => ({
        value: ent.id.toString(),
        label: ent.nomE
      })) : []
    },
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

    if (filters.entreprise) {
      result = result.filter(ad =>
        ad.entreprise_id.toString() === filters.entreprise.toString()
      );
    }

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

    setFilteredAds(result);
  };
  // const renderActionButtons = (advertisement) => {
  //   return (
  //     <td>
  //       <button
  //         className="btn btn-info btn-sm"
  //         style={{ marginRight: '5px' }}
  //         onClick={() => navigate(`/advertisements/info/${advertisement.id}`)}
  //       >
  //         <i className="bi bi-info-lg"></i> Info
  //       </button>

  //       {advertisement.statut === 'pending' && (
  //         <>
  //           <button
  //             className="btn btn-success btn-sm"
  //             style={{ marginRight: '5px' }}
  //             onClick={() => handleUpdateStatus(advertisement.id, 'approved')}
  //           >
  //             Approve
  //           </button>
  //           <button
  //             className="btn btn-danger btn-sm"
  //             onClick={() => handleUpdateStatus(advertisement.id, 'rejected')}
  //           >
  //             Reject
  //           </button>
  //         </>
  //       )}

  //       {advertisement.statut === 'approved' && (
  //         <button
  //           className="btn btn-danger btn-sm"
  //           onClick={() => handleUpdateStatus(advertisement.id, 'rejected')}
  //         >
  //           Reject
  //         </button>
  //       )}
  //     </td>
  //   );
  // };
  const renderActionButtons = (advertisement) => {
    return (
      <td>
        <button
          className="btn btn-info btn-sm me-2"
          onClick={() => navigate(`/admin/advertisements/info/${advertisement.id}`)}
        >
          <i className="bi bi-info-lg"></i>
        </button>

        {advertisement.statut === 'pending' && (
          <>
            <button
              className="btn btn-success btn-sm"
              style={{ marginRight: '5px' }}
              onClick={() => handleUpdateStatus(advertisement.id, 'approved')}
            >
              Approve
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleUpdateStatus(advertisement.id, 'rejected')}
            >
              Reject
            </button>
          </>
        )}

        {advertisement.statut === 'approved' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleUpdateStatus(advertisement.id, 'rejected')}
          >
            Reject
          </button>
        )}

        {advertisement.statut === 'rejected' && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleUpdateStatus(advertisement.id, 'approved')}
          >
            Approve
          </button>
        )}
      </td>
    );
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">
        {/* Breadcrumb start */}
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{ color: '#4a7c87' }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{ color: '#4a7c87' }}>
              Home
            </a>
          </li>
          <li className="breadcrumb-item" aria-current="page">
            Advertisements
          </li>
        </ol>
        {/* Breadcrumb end */}
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

export default AdListAd;