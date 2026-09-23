import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getAllPostsForAdmin, updatePosteStatus } from '../../../services/postService';
import { ToastContainer, toast } from 'react-toastify';
import { getAllCategories } from '../../../services/categoryService';
import { getAllEntreprises } from '../../../services/entrepriseService';
import FilterComponent from '../shared/FilterComponent';

const PostListAd = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entreprises, setEnterprises] = useState([]);
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
        loadPosts();
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

    // Update loadPosts to load all required data
    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const [postsData, categoriesData, entreprisesData] = await Promise.all([
                getAllPostsForAdmin(),
                getAllCategories(),
                getAllEntreprises()
            ]);

            setPosts(postsData || []);
            setCategories(categoriesData || []);
            setEnterprises(entreprisesData || []);
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
        let result = [...posts];

        if (filters.category) {
            result = result.filter(post =>
                post.categorie_id === parseInt(filters.category)
            );
        }

        if (filters.entreprise) {
            result = result.filter(post =>
                post.entreprise_id.toString() === filters.entreprise.toString()
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
    }, [posts, filters]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    const handleUpdateStatus = async (id, status) => {
        try {
            await updatePosteStatus(id, status);
            toast.success(`Publication ${status} successfully`);
            loadPosts(); // Recharger la liste après mise à jour
        } catch (error) {
            console.error('Error updating publication status:', error);
            toast.error('Failed to update publication status');
        }
    };
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
                    <li className="breadcrumb-item" aria-current="page">Publications</li>
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
                                                            onClick={() => navigate(`/admin/posts/info/${post.id}`)}
                                                        >
                                                            <i className="bi bi-info-lg"></i>
                                                        </a>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            style={{ marginRight: '5px' }}
                                                            onClick={() => handleUpdateStatus(post.id, 'approved')}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleUpdateStatus(post.id, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
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

export default PostListAd;