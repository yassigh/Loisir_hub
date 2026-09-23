//src/components/admin/activity/ActivityListAd.jsx
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAllActivitiesForAdmin, updateActivityStatus } from '../../../services/activityService';
import { ToastContainer, toast } from 'react-toastify';
import { Menu } from '@headlessui/react';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import FilterComponent from '../shared/FilterComponent';
import { getAllCategories } from '../../../services/categoryService';
import { getAllEntreprises } from '../../../services/entrepriseService';


const ActivityListAd = () => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entreprises, setEnterprises] = useState([]); // Initialize as empty array
    const [filters, setFilters] = useState({
        category: '',
        entreprise: '',
        status: '',
        region: ''
    });


    useEffect(() => {
        // Initialiser les icônes Lucide après le rendu du composant
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
        loadActivities();
    }, []);
    const loadActivities = async () => {
        setIsLoading(true);
        try {
            const data = await getAllActivitiesForAdmin();
            if (data) {
                setActivities(data);
            }
        } catch (error) {
            console.error('Error loading activities:', error);
            toast.error('Failed to load activities');
        } finally {
            setIsLoading(false);
        }
    };
    const handleUpdateStatus = async (id, status) => {
        try {
            await updateActivityStatus(id, status);
            toast.success(`Activity ${status} successfully`);
            loadActivities(); // Recharger la liste après mise à jour
        } catch (error) {
            console.error('Error updating activity status:', error);
            toast.error('Failed to update activity status');
        }
    };
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [activities, filters]);

    //v2.0
    const loadData = async () => {
        try {
            const [activitiesData, categoriesData, entreprisesData] = await Promise.all([
                getAllActivitiesForAdmin(),
                getAllCategories(),
                getAllEntreprises()
            ]);
    
            console.log('Activities:', activitiesData);
            console.log('Entreprises:', entreprisesData);
    
            setActivities(activitiesData || []);
            setCategories(categoriesData || []);
            setEnterprises(entreprisesData || []);
            setFilteredActivities(activitiesData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        }
    };
    //v1.0
    // const loadData = async () => {
    //     try {
    //         const [activitiesData, categoriesData, entreprisesData] = await Promise.all([
    //             getAllActivitiesForAdmin(),
    //             getAllCategories(),
    //             getAllEntreprises()
    //         ]);

    //         setActivities(activitiesData || []);
    //         setCategories(categoriesData || []);
    //         setEnterprises(entreprisesData || []);
    //         setFilteredActivities(activitiesData || []);
    //     } catch (error) {
    //         console.error('Error loading data:', error);
    //         toast.error('Failed to load data');
    //         // Set default empty arrays on error
    //         setActivities([]);
    //         setCategories([]);
    //         setEnterprises([]);
    //         setFilteredActivities([]);
    //     }
    // };

    //v2.0
    const applyFilters = () => {
        let result = [...activities];
    
        if (filters.category) {
            result = result.filter(activity =>
                activity.categorie_id === parseInt(filters.category)
            );
        }
    
        if (filters.entreprise) {
            console.log('Filtering by entreprise:', filters.entreprise);
            console.log('Activity entreprise_id example:', result[0]?.entreprise_id);
            result = result.filter(activity => {
                // Convertissez les deux en string pour la comparaison
                return activity.entreprise_id.toString() === filters.entreprise.toString()
            });
        }
    
        if (filters.status) {
            result = result.filter(activity =>
                activity.status === filters.status
            );
        }
        if (filters.region) {
            result = result.filter(activity =>
                activity.regionP === filters.region
            );
        }
    
        setFilteredActivities(result);
    };
    //v1.0
    // const applyFilters = () => {
    //     let result = [...activities];

    //     if (filters.category) {
    //         result = result.filter(activity =>
    //             activity.categorie_id === parseInt(filters.category)
    //         );
    //     }

    //     if (filters.entreprise) {
    //         result = result.filter(activity =>
    //             activity.entreprise_id === parseInt(filters.entreprise)
    //         );
    //     }

    //     if (filters.status) {
    //         result = result.filter(activity =>
    //             activity.status === filters.status
    //         );
    //     }

    //     setFilteredActivities(result);
    // };

    const handleFilterChange = (filterName, value) => {
        console.log(`Filter changed: ${filterName} = ${value}`);
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [filterName]: value
            };
            console.log('New filters:', newFilters);
            return newFilters;
        });
    };

    //v2.0
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
                value: ent.id.toString(), // Assurez-vous que l'ID est une chaîne
                label: `${ent.nomE}` // Ajoutez l'ID pour debug
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
    //v1.0
    // const filterConfig = [
    //     {
    //         name: 'category',
    //         label: 'Category',
    //         options: Array.isArray(categories) ? categories.map(cat => ({
    //             value: cat.id.toString(),
    //             label: cat.nomCat
    //         })) : []
    //     },
    //     {
    //         name: 'entreprise',
    //         label: 'Enterprise',
    //         options: Array.isArray(entreprises) ? entreprises.map(ent => ({
    //             value: ent.id.toString(),
    //             label: ent.nomE
    //         })) : []
    //     },
    //     {
    //         name: 'status',
    //         label: 'Status',
    //         options: [
    //             { value: 'pending', label: 'Pending' },
    //             { value: 'approved', label: 'Approved' },
    //             { value: 'rejected', label: 'Rejected' }
    //         ]
    //     }
    // ];

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
                    <li className="breadcrumb-item" aria-current="page">Activities</li>
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
                                            <th scope="col">Id</th>
                                            <th scope="col">
                                                ACTIVITY NAME
                                            </th>
                                            <th scope="col">LOCATION</th>
                                            <th scope="col">REGION</th>
                                            <th scope="col">PRICE</th>
                                            <th scope="col">DURATION</th>
                                            <th scope="col">OFFER</th>
                                            <th scope="col">STATUS</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    {/* V1.0 */}
                                    {/* <tbody>
                                        {Array.isArray(activities) && activities.length > 0 ? (
                                            activities.map((activity) => (
                                                <tr key={activity.id}>
                                                    <td> {activity.idActP}</td>
                                                    <th scope="row">
                                                        {activity.nomActP}
                                                    </th>
                                                    <td> {activity.lieuP}</td>
                                                    <td> {activity.regionP}</td>
                                                    <td> {activity.prixP}</td>
                                                    <td>
                                                        {activity.jours ? `${activity.jours} days ` : ''}
                                                        {activity.heure ? `${activity.heure}h ` : ''}
                                                        {activity.minute ? `${activity.minute}min` : ''}
                                                    </td>
                                                    <td> {activity.offreP}</td>
                                                    <td>
                                                        {activity.status === 'approved' && (
                                                            <span className="badge border border-success text-success">Approved</span>
                                                        )}
                                                        {activity.status === 'pending' && (
                                                            <span className="badge border border-warning text-warning">Pending</span>
                                                        )}
                                                        {activity.status === 'rejected' && (
                                                            <span className="badge border border-danger text-danger">Rejected</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                    <a
                                                            className="btn btn-primary btn-sm"
                                                            style={{ marginRight: '10px' }}
                                                            onClick={() => navigate(`/admin/activities/info/${activity.idActP}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            style={{ marginRight: '5px' }}
                                                            onClick={() => handleUpdateStatus(activity.idActP, 'approved')}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleUpdateStatus(activity.idActP, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No activity found</td>
                                            </tr>
                                        )}
                                    </tbody> */}
                                    <tbody>
                                        {Array.isArray(filteredActivities) && filteredActivities.length > 0 ? (
                                            filteredActivities.map((activity) => (
                                                <tr key={activity.idActP}>
                                                    <td>{activity.idActP}</td>
                                                    <th scope="row">
                                                        {activity.nomActP}
                                                    </th>
                                                    <td>{activity.lieuP}</td>
                                                    <td>{activity.regionP}</td>
                                                    <td>{activity.prixP}</td>
                                                    <td>
                                                        {activity.jours ? `${activity.jours} days ` : ''}
                                                        {activity.heure ? `${activity.heure}h ` : ''}
                                                        {activity.minute ? `${activity.minute}min` : ''}
                                                    </td>
                                                    <td>{activity.offreP}</td>
                                                    <td>
                                                        {activity.status === 'approved' && (
                                                            <span className="badge border border-success text-success">Approved</span>
                                                        )}
                                                        {activity.status === 'pending' && (
                                                            <span className="badge border border-warning text-warning">Pending</span>
                                                        )}
                                                        {activity.status === 'rejected' && (
                                                            <span className="badge border border-danger text-danger">Rejected</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <a
                                                            className="btn btn-primary btn-sm"
                                                            style={{ marginRight: '10px' }}
                                                            onClick={() => navigate(`/admin/activities/info/${activity.idActP}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            style={{ marginRight: '5px' }}
                                                            onClick={() => handleUpdateStatus(activity.idActP, 'approved')}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleUpdateStatus(activity.idActP, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No activities found</td>
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

export default ActivityListAd;
