// import React, { useState, useEffect } from 'react';
// import { getAllReservationsForAdmin } from '../../../services/ReservationService';
// import { ToastContainer, toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// const ReservationsAd = () => {
//     const [reservations, setReservations] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         loadReservations();
//     }, []);

//     const loadReservations = async () => {
//         setIsLoading(true);
//         try {
//             const data = await getAllReservationsForAdmin();
//             setReservations(data);
//         } catch (error) {
//             toast.error('Failed to load reservations');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div>
//             <div className="app-hero-header d-flex align-items-start">

//                 {/* Breadcrumb start */}
//                 <ol className="breadcrumb">
//                     <li className="breadcrumb-item">
//                         <i className="bi bi-house lh-1"  style={{ 
//     color: '#4a7c87', 

//   }}></i>
//                         <a href="index-2.html" className="text-decoration-none"  style={{ 
//     color: '#4a7c87', 

//   }}>Home</a>
//                     </li>
//                     <li className="breadcrumb-item" aria-current="page">Reservations</li>
//                 </ol>
//                 {/* Breadcrumb end */}

//                 {/* Sales stats start */}

//                 {/* Sales stats end */}

//             </div>
//             <div className="row gx-3">
//                 <div className="col-xxl-12">
//                     <div className="card mb-3">
//                         <div className="card-body">
//                             <div className="table-responsive">
//                                 <table className="table align-middle table-hover m-0">
//                                     <thead>
//                                         <tr>
//                                             <th>Activity Name</th>
//                                             <th>User Name</th>
//                                             <th>Email</th>
//                                             <th>Phone</th>
//                                             <th>Total Amount</th>
//                                             <th>Start Date</th>
//                                             <th>End Date</th>
//                                             <th>Status</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {reservations.length > 0 ? (
//                                             reservations.map((reservation) => (
//                                                 <tr key={reservation.id_Res}>
//                                                     <td>{reservation.activite?.nomActP}</td>
//                                                     <td>{reservation.user?.name}</td>
//                                                     <td>{reservation.user?.email}</td>
//                                                     <td>{reservation.num_tel}</td>
//                                                     <td>{reservation.montant} TND</td>
//                                                     <td>{reservation.dateDebut}</td>
//                                                     <td>{reservation.dateFin}</td>
//                                                     <td>
//                                                         {reservation.etat === 'accepte' && (
//                                                             <span className="badge border border-success text-success">Accepted</span>
//                                                         )}
//                                                         {reservation.etat === 'refuse' && (
//                                                             <span className="badge border border-danger text-danger">Rejected</span>
//                                                         )}
//                                                         {reservation.etat === 'en attente' && (
//                                                             <span className="badge border border-warning text-warning">En Attente</span>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan="8" className="text-center">No reservations found</td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ReservationsAd;
import React, { useState, useEffect } from 'react';
import { getAllReservationsForAdmin } from '../../../services/ReservationService';
import { getAllActivitiesForAdmin } from '../../../services/activityService';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import FilterComponent from '../shared/FilterComponent';
import { getAllEntreprises } from '../../../services/entrepriseService';


const ReservationsAd = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [entreprises, setEnterprises] = useState([]);
    const [filters, setFilters] = useState({
        activity: '',
        entreprise: '',
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
            name: 'entreprise',
            label: 'Enterprise',
            options: Array.isArray(entreprises) ? entreprises.map(ent => ({
                value: ent.id.toString(),
                label: `${ent.nomE} `  // Add ID for debugging
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

    const loadReservations = async () => {
        setIsLoading(true);
        try {
            const [reservationsResponse, activitiesData, entreprisesResponse] = await Promise.all([
                getAllReservationsForAdmin(),
                getAllActivitiesForAdmin(),
                getAllEntreprises()
            ]);
    
            console.log('Raw Reservations:', reservationsResponse);
            console.log('Raw Enterprises:', entreprisesResponse);
    
            if (reservationsResponse.status === 'success' && Array.isArray(reservationsResponse.reservations)) {
                const reservationsWithData = reservationsResponse.reservations.map(reservation => ({
                    ...reservation,
                    // Ensure entreprise_id is available at root level if needed
                    entreprise_id: reservation.entreprise_id || reservation.activite_payant?.entreprise_id
                }));
                
                setReservations(reservationsWithData);
                setFilteredReservations(reservationsWithData);
            }
    
            setActivities(activitiesData || []);
            setEnterprises(entreprisesResponse || []);
    
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterChange = (filterName, value) => {
        console.log(`Filter changed: ${filterName} = ${value}`);
        console.log('Current reservations:', reservations);
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [filterName]: value
            };
            console.log('New filters:', newFilters);
            return newFilters;
        });
    };

    //v3.0
    const applyFilters = () => {
        let result = [...reservations];
    
        if (filters.activity) {
            result = result.filter(reservation =>
                reservation.activite_payant?.idActP?.toString() === filters.activity
            );
        }
    
        if (filters.entreprise) {
            result = result.filter(reservation => {
                // Add debug logging
                console.log('Checking reservation:', reservation);
                console.log('Activity:', reservation.activite_payant);
                console.log('Enterprise ID:', reservation.entreprise_id);
                console.log('Filter Enterprise ID:', filters.entreprise);
                
                // Check both entreprise_id in reservation and in activite_payant
                return (
                    reservation.entreprise_id?.toString() === filters.entreprise ||
                    reservation.activite_payant?.entreprise_id?.toString() === filters.entreprise
                );
            });
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
    
        console.log('Filtered Results:', result);
        setFilteredReservations(result);
    };
    //v2.0
    // const applyFilters = () => {
    //     let result = [...reservations];

    //     if (filters.activity) {
    //         result = result.filter(reservation =>
    //             reservation.activite_payant?.idActP?.toString() === filters.activity
    //         );
    //     }

    //     if (filters.entreprise) {
    //         result = result.filter(reservation => {
    //             // Vérifier si activite_payant et entreprise_id existent
    //             if (!reservation.activite_payant || !reservation.activite_payant.entreprise_id) {
    //                 return false;
    //             }
    //             return reservation.activite_payant.entreprise_id.toString() === filters.entreprise.toString();
    //         });
    //     }

    //     if (filters.status) {
    //         result = result.filter(reservation =>
    //             reservation.etat === filters.status
    //         );
    //     }

    //     if (filters.dateRange) {
    //         const today = new Date();
    //         const reservationDate = (date) => new Date(date);

    //         switch (filters.dateRange) {
    //             case 'today':
    //                 result = result.filter(reservation => {
    //                     const date = reservationDate(reservation.dateDebut);
    //                     return date.toDateString() === today.toDateString();
    //                 });
    //                 break;
    //             case 'week':
    //                 const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    //                 result = result.filter(reservation => {
    //                     const date = reservationDate(reservation.dateDebut);
    //                     return date >= weekAgo;
    //                 });
    //                 break;
    //             case 'month':
    //                 const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    //                 result = result.filter(reservation => {
    //                     const date = reservationDate(reservation.dateDebut);
    //                     return date >= monthAgo;
    //                 });
    //                 break;
    //         }
    //     }

    //     setFilteredReservations(result);
    // };
    //v1.0
    // const applyFilters = () => {
    //     let result = [...reservations];

    //     if (filters.activity) {
    //         result = result.filter(reservation => 
    //             reservation.activite_payant?.idActP.toString() === filters.activity
    //         );
    //     }

    //     if (filters.entreprise) {
    //         result = result.filter(reservation => 
    //             reservation.activite_payant?.entreprise_id.toString() === filters.entreprise.toString()
    //         );
    //     }

    //     if (filters.status) {
    //         result = result.filter(reservation => 
    //             reservation.etat === filters.status
    //         );
    //     }

    //     if (filters.dateRange) {
    //         const today = new Date();
    //         const reservationDate = (date) => new Date(date);

    //         switch (filters.dateRange) {
    //             case 'today':
    //                 result = result.filter(reservation => {
    //                     const date = reservationDate(reservation.dateDebut);
    //                     return date.toDateString() === today.toDateString();
    //                 });
    //                 break;
    //             case 'week':
    //                 const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    //                 result = result.filter(reservation => {
    //                     const date = reservationDate(reservation.dateDebut);
    //                     return date >= weekAgo;
    //                 });
    //                 break;
    //             case 'month':
    //                 const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    //                 result = result.filter(reservation => {
    //                     const date = reservationDate(reservation.dateDebut);
    //                     return date >= monthAgo;
    //                 });
    //                 break;
    //         }
    //     }

    //     setFilteredReservations(result);
    // };

    // useEffect(() => {
    //     loadData();
    // }, []);

    useEffect(() => {
        applyFilters();
    }, [reservations, filters]);


    useEffect(() => {
        loadReservations();
    }, []);

    // const loadReservations = async () => {
    //     setIsLoading(true);
    //     try {
    //         const response = await getAllReservationsForAdmin();
    //         console.log("Response:", response); // Debug log

    //         if (response.status === 'success' && Array.isArray(response.reservations)) {
    //             setReservations(response.reservations);
    //         } else {
    //             toast.error('Invalid response format');
    //         }
    //     } catch (error) {
    //         console.error("Reservation error:", error);
    //         toast.error(error.message || 'Failed to load reservations');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReservations.length > 0 ? (
                                            filteredReservations.map((reservation) => (
                                                <tr key={reservation.id_Res}>
                                                    <td>{reservation.activite_payant ? reservation.activite_payant.nomActP : 'N/A'}</td>
                                                    <td>{reservation.user?.name || 'N/A'}</td>
                                                    <td>{reservation.user?.email || 'N/A'}</td>
                                                    <td>{reservation.user?.numTelU || 'N/A'}</td>
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
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">No reservations found</td>
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

export default ReservationsAd;