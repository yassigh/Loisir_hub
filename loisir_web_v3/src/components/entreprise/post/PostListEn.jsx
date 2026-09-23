import React, { useState, useEffect } from 'react';
import { deletePost, getEnterprisePosts } from '../../../services/postService';
import { ToastContainer, toast } from 'react-toastify';
import { Menu } from '@headlessui/react';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import FilterComponent from '../../admin/shared/FilterComponent';

function PostListEn() {
    const [postes, setPostes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [filteredPosts, setFilteredPosts] = useState([]);
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
        loadPostes();
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

    // Update loadPostes function
    const loadPostes = async () => {
        setIsLoading(true);
        try {
            const [postsData, categoriesData] = await Promise.all([
                getEnterprisePosts(),
                getAllCategories()
            ]);

            setPostes(postsData || []);
            setCategories(categoriesData || []);
            setFilteredPosts(postsData || []);
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
        let result = [...postes];

        if (filters.category) {
            result = result.filter(post =>
                post.categorie_id === parseInt(filters.category)
            );
        }

        if (filters.status) {
            result = result.filter(post =>
                post.status === filters.status
            );
        }

        if (filters.region) {
            result = result.filter(post =>
                post.regionPoste === filters.region
            );
        }

        setFilteredPosts(result);
    };

    // Add effect for filters
    useEffect(() => {
        applyFilters();
    }, [postes, filters]);
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this poste?')) {
            try {
                await deletePost(id);
                toast.success('Poste deleted successfully');
                loadPostes();
            } catch (error) {
                console.error('Error deleting poste:', error);
                toast.error('Failed to delete poste');
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
                    <li className="breadcrumb-item" aria-current="page">Publications</li>
                </ol>
                <button style={{
                    backgroundColor: '#4a7c87',


                }}
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/enterprise/posts/add')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Add New Publication
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
                                                PUBLICATION NAME
                                            </th>
                                            <th scope="col">LOCATION</th>
                                            <th scope="col">REGION</th>
                                            <th scope="col">STATUS</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                                            filteredPosts.map((post) => (
                                                <tr key={post.id}>
                                                    <td> {post.id}</td>
                                                    <th scope="row">
                                                        {post.nomPoste}
                                                    </th>
                                                    <td> {post.lieuPoste}</td>
                                                    <td> {post.regionPoste}</td>
                                                    <td>
                                                        {post.status === 'approved' && (
                                                            <span className="badge border border-success text-success">Approved</span>
                                                        )}
                                                        {post.status === 'pending' && (
                                                            <span className="badge border border-warning text-warning">Pending</span>
                                                        )}
                                                        {post.status === 'rejected' && (
                                                            <span className="badge border border-danger text-danger">Rejected</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <a
                                                            className="btn btn-primary btn-sm"
                                                            style={{ marginRight: '10px' }}
                                                            onClick={() => navigate(`/enterprise/posts/info/${post.id}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <a className="btn btn-info btn-sm" style={{ marginRight: '10px' }} onClick={() => navigate(`/enterprise/posts/edit/${post.id}`)} ><i className="bi bi-pencil"></i>
                                                        </a>
                                                        <a className="btn btn-danger btn-icon btn-sm" style={{ marginRight: '10px' }} onClick={() => handleDelete(post.id)}><i className="bi bi-trash"></i>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No posts found</td>
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

export default PostListEn