//v1.0 ActivityList.jsx

// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Menu } from '@headlessui/react';
// import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import React, { useState, useEffect } from 'react';
import { deleteActivity, getEnterpriseActivities } from '../../../services/activityService';
import { ToastContainer, toast } from 'react-toastify';
import { Menu } from '@headlessui/react';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import FilterComponent from '../../admin/shared/FilterComponent';
import { getAllCategories } from '../../../services/categoryService';



const ActivityListEn = () => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [filteredActivities, setFilteredActivities] = useState([]);
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
        loadActivities();
    }, []);
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

    const loadActivities = async () => {
        setIsLoading(true);
        try {
            const [activitiesData, categoriesData] = await Promise.all([
                getEnterpriseActivities(),
                getAllCategories()
            ]);

            setActivities(activitiesData || []);
            setCategories(categoriesData || []);
            setFilteredActivities(activitiesData || []);
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

    const applyFilters = () => {
        let result = [...activities];

        if (filters.category) {
            result = result.filter(activity =>
                activity.categorie_id === parseInt(filters.category)
            );
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

    useEffect(() => {
        applyFilters();
    }, [activities, filters]);
    // const loadActivities = async () => {
    //     setIsLoading(true);
    //     try {
    //         const data = await getEnterpriseActivities();
    //         if (data) {
    //             setActivities(data);
    //         }
    //     } catch (error) {
    //         console.error('Error loading activities:', error);
    //         toast.error('Failed to load activities');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await deleteActivity(id);
                toast.success('Activity deleted successfully');
                loadActivities();
            } catch (error) {
                console.error('Error deleting activity:', error);
                toast.error('Failed to delete activity');
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
                    <li className="breadcrumb-item" aria-current="page">Activities</li>
                </ol>

                <button style={{
                    backgroundColor: '#4a7c87',


                }}
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/enterprise/activities/add')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Add New Activity
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
                                    <tbody>
                                        {Array.isArray(filteredActivities) && filteredActivities.length > 0 ? (
                                            filteredActivities.map((activity) => (
                                                <tr key={activity.idActP}>
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
                                                            onClick={() => navigate(`/enterprise/activities/info/${activity.idActP}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <a className="btn btn-info btn-sm" style={{ marginRight: '10px' }} onClick={() => navigate(`/enterprise/activities/edit/${activity.idActP}`)} ><i className="bi bi-pencil"></i>
                                                        </a>
                                                        <a className="btn btn-danger btn-icon btn-sm" style={{ marginRight: '10px' }} onClick={() => handleDelete(activity.idActP)}><i className="bi bi-trash"></i>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No activity found</td>
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

export default ActivityListEn;
