import React, { useState, useEffect } from 'react';
import { getEnterpriseReservations, updateReservationStatus } from '../../../services/ReservationService';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import FilterComponent from '../../admin/shared/FilterComponent';
import { getEnterpriseActivities } from '../../../services/activityService';

const ReservationsEn = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [filters, setFilters] = useState({
        activity: '',
        status: '',
        dateRange: ''
    });
    const filterConfig = [
        {
            name: 'activity',
            label: 'Activity',
            options: Array.isArray(activities) ? activities.map(act => ({
                value: act.idActP.toString(),
                label: act.nomActP
            })) : []
        },
        {
            name: 'status',
            label: 'Status',
            options: [
                { value: 'en attente', label: 'En Attente' },
                { value: 'accepte', label: 'Accepté' },
                { value: 'refuse', label: 'Refusé' }
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

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        setIsLoading(true);
        try {
            const [reservationsResponse, activitiesData] = await Promise.all([
                getEnterpriseReservations(),
                getEnterpriseActivities()
            ]);

            if (reservationsResponse.status === 'success' && Array.isArray(reservationsResponse.reservations)) {
                setReservations(reservationsResponse.reservations);
                setFilteredReservations(reservationsResponse.reservations);
            }

            setActivities(activitiesData || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };
    // const loadReservations = async () => {
    //     setIsLoading(true);
    //     try {
    //         const response = await getEnterpriseReservations();
    //         if (response.status === 'success' && Array.isArray(response.reservations)) {
    //             setReservations(response.reservations);
    //         } else {
    //             toast.error('Invalid response format');
    //         }
    //     } catch (error) {
    //         console.error('Reservation error:', error);
    //         toast.error(error.message || 'Failed to load reservations');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // Add filter handlers
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Add filter logic
    const applyFilters = () => {
        let result = [...reservations];

        if (filters.activity) {
            result = result.filter(reservation =>
                reservation.activite_payant?.idActP?.toString() === filters.activity
            );
        }

        if (filters.status) {
            result = result.filter(reservation =>
                reservation.etat === filters.status
            );
        }

        if (filters.dateRange) {
            const today = new Date();
            const reservationDate = (date) => new Date(date);

            switch (filters.dateRange) {
                case 'today':
                    result = result.filter(reservation => {
                        const date = reservationDate(reservation.dateDebut);
                        return date.toDateString() === today.toDateString();
                    });
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    result = result.filter(reservation => {
                        const date = reservationDate(reservation.dateDebut);
                        return date >= weekAgo;
                    });
                    break;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    result = result.filter(reservation => {
                        const date = reservationDate(reservation.dateDebut);
                        return date >= monthAgo;
                    });
                    break;
            }
        }

        setFilteredReservations(result);
    };

    // Add effect for filters
    useEffect(() => {
        applyFilters();
    }, [reservations, filters]);

    const handleUpdateStatus = async (id, etat) => {
        try {
            await updateReservationStatus(id, etat);
            toast.success(`Reservation ${etat} successfully`);
            loadReservations();
        } catch (error) {
            toast.error('Failed to update reservation status');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ marginLeft: '10px' }}>
            <div className="app-hero-header d-flex align-items-start">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <i className="bi bi-house lh-1" style={{ color: '#4a7c87' }}></i>
                        <a href="index-2.html" className="text-decoration-none" style={{ color: '#4a7c87' }}>Home</a>
                    </li>
                    <li className="breadcrumb-item" aria-current="page">Reservations</li>
                </ol>
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
                                            <th>Activity Name</th>
                                            <th>User Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Total Amount</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReservations.length > 0 ? (
                                            filteredReservations.map((reservation) => (
                                                <tr key={reservation.id_Res}>
                                                    <td>{reservation.activite_payant?.nomActP || 'N/A'}</td>
                                                    <td>{reservation.user?.name || 'N/A'}</td>
                                                    <td>{reservation.user?.email || 'N/A'}</td>
                                                    <td>{reservation.user?.numTelU || reservation.num_tel || 'N/A'}</td>
                                                    <td>{reservation.montant} TND</td>
                                                    <td>{reservation.dateDebut}</td>
                                                    <td>{reservation.dateFin}</td>
                                                    <td>
                                                        {reservation.etat === 'accepte' && (
                                                            <span className="badge border border-success text-success">Accepted</span>
                                                        )}
                                                        {reservation.etat === 'refuse' && (
                                                            <span className="badge border border-danger text-danger">Rejected</span>
                                                        )}
                                                        {reservation.etat === 'en attente' && (
                                                            <span className="badge border border-warning text-warning">En Attente</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {reservation.etat === 'en attente' && (
                                                            <>
                                                                <button
                                                                    className="btn btn-success btn-sm me-2"
                                                                    onClick={() => handleUpdateStatus(reservation.id_Res, 'accepte')}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleUpdateStatus(reservation.id_Res, 'refuse')}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="text-center">No reservations found</td>
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

export default ReservationsEn;