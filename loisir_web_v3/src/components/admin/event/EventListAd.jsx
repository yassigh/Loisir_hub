import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEventsForAdmin, updateEventStatus } from '../../../services/eventService';
import { getAllCategories } from '../../../services/categoryService';
import { getAllEntreprises } from '../../../services/entrepriseService';
import { ToastContainer, toast } from 'react-toastify';
import FilterComponent from '../shared/FilterComponent';

const EventListAd = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entreprises, setEnterprises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: '',
        entreprise: '',
        status: '',
        region: ''
    });

    useEffect(() => {
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
        loadEvents();
        
    }, []);

    // const loadEvents = async () => {
    //     setIsLoading(true);
    //     try {
    //         const data = await getAllEventsForAdmin();
    //         setEvents(data); // Added fallback empty array
    //     } catch (error) {
    //         console.error('Error loading events:', error);
    //         toast.error('Failed to load events');
    //         setEvents([]); // Set empty array on error
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    const handleUpdateStatus = async (id, status) => {
        try {
            await updateEventStatus(id, status);
            toast.success(`Event ${status} successfully`);
            loadEvents(); // Recharger la liste après mise à jour
        } catch (error) {
            console.error('Error updating event status:', error);
            toast.error('Failed to update event status');
        }
    };

    const filterConfig = [
        {
            name: 'category',
            label: 'Category',
            options: Array.isArray(categories) ? categories.map(cat => ({
                value: cat.id.toString(),
                label: cat.nomCat
            })) : []
        },
        {
            name: 'entreprise',
            label: 'Enterprise',
            options: Array.isArray(entreprises) ? entreprises.map(ent => ({
                value: ent.id.toString(),
                label: ent.nomE
            })) : []
        },
        {
            name: 'region',
            label: 'Region',
            options: [
                'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
                'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
                'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
                'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
            ].map(region => ({
                value: region,
                label: region
            }))
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
    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const [eventsData, categoriesData, entreprisesData] = await Promise.all([
                getAllEventsForAdmin(),
                getAllCategories(),
                getAllEntreprises()
            ]);
            
            setEvents(eventsData || []);
            setCategories(categoriesData || []);
            setEnterprises(entreprisesData || []);
            setFilteredEvents(eventsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };
    useEffect(() => {
        applyFilters();
    }, [events, filters]);
    
    const applyFilters = () => {
        let result = [...events];
    
        if (filters.category) {
            result = result.filter(event =>
                event.categorie_id === parseInt(filters.category)
            );
        }
    
        if (filters.entreprise) {
            result = result.filter(event =>
                event.entreprise_id.toString() === filters.entreprise.toString()
            );
        }
    
        if (filters.status) {
            result = result.filter(event =>
                event.status === filters.status
            );
        }
    
        if (filters.region) {
            result = result.filter(event =>
                event.regionEvent === filters.region
            );
        }
    
        setFilteredEvents(result);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ marginLeft: '10px' }}>
            <div className="app-hero-header d-flex align-items-start">

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
                    <li className="breadcrumb-item" aria-current="page">Events</li>
                </ol>
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
                                            <th scope="col">
                                                EVENT NAME

                                            </th>
                                            <th scope="col">LOCATION</th>
                                            <th scope="col">REGION</th>
                                            <th scope="col">START DATE</th>
                                            <th scope="col">END DATE</th>
                                            <th scope="col">TYPE</th>
                                            <th scope="col">STATUS</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
                                        filteredEvents.map((event) => (
                                                <tr key={event.id}>
                                                    <td> {event.id}</td>
                                                    <th scope="row">
                                                        {event.nomEvent}
                                                    </th>
                                                    <td> {event.lieuEvent}</td>
                                                    <td> {event.regionEvent}</td>
                                                    <td>
                                                        {event.date_debutEvent}
                                                    </td>
                                                    <td>
                                                        {event.date_finEvent}
                                                    </td>
                                                    <td> {event.typeEvent}</td>
                                                    <td>
                                                        {event.status === 'approved' && (
                                                            <span className="badge border border-success text-success">Approved</span>
                                                        )}
                                                        {event.status === 'pending' && (
                                                            <span className="badge border border-warning text-warning">Pending</span>
                                                        )}
                                                        {event.status === 'rejected' && (
                                                            <span className="badge border border-danger text-danger">Rejected</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <a
                                                            className="btn btn-primary btn-sm"
                                                            style={{ marginRight: '10px' }}
                                                            onClick={() => navigate(`/admin/events/info/${event.id}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            style={{ marginRight: '5px' }}
                                                            onClick={() => handleUpdateStatus(event.id, 'approved')}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleUpdateStatus(event.id, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No events found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventListAd;