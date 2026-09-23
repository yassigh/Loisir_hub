import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getEnterpriseEvents, deleteEvent } from '../../../services/eventService';
import FilterComponent from '../../admin/shared/FilterComponent';
import { getAllCategories } from '../../../services/categoryService';


function EventListEn() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        region: ''

        });

    useEffect(() => {
        // Initialiser les icônes Lucide après le rendu du composant
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
        loadEvents();
    }, []);

    // Add filter configuration
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

    // Update loadEvents function
    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const [eventsData, categoriesData] = await Promise.all([
                getEnterpriseEvents(),
                getAllCategories()
            ]);

            setEvents(eventsData || []);
            setCategories(categoriesData || []);
            setFilteredEvents(eventsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Add filter handlers
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const applyFilters = () => {
        let result = [...events];

        if (filters.category) {
            result = result.filter(event =>
                event.categorie_id === parseInt(filters.category)
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

        if (filters.type) {
            result = result.filter(event =>
                event.typeEvent === filters.type
            );
        }

        setFilteredEvents(result);
    };

    // Add effect for filters
    useEffect(() => {
        applyFilters();
    }, [events, filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(id);
                toast.success('Event deleted successfully');
                loadEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
                toast.error('Failed to delete event');
            }
        }
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
                    <li className="breadcrumb-item" aria-current="page">Events</li>
                </ol>
                <button style={{
                    backgroundColor: '#4a7c87',


                }}
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/enterprise/events/add')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Add New Event
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
                                                            onClick={() => navigate(`/enterprise/events/info/${event.id}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <a className="btn btn-info btn-sm" style={{ marginRight: '10px' }} onClick={() => navigate(`/enterprise/events/edit/${event.id}`)} ><i className="bi bi-pencil"></i>
                                                        </a>
                                                        <a className="btn btn-danger btn-icon btn-sm" style={{ marginRight: '10px' }} onClick={() => handleDelete(event.id)}><i className="bi bi-trash"></i>
                                                        </a>
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

export default EventListEn