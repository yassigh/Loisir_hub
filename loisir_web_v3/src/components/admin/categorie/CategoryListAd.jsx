
//v1.0
import React, { useState, useEffect } from 'react';
import { getAllCategories, deleteCategory } from '../../../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { toast } from 'react-toastify';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
const CategoryListAd = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setIsLoading(true);
      try {
        await deleteCategory(id);
        // Remove the deleted category from state
        setCategories(categories.filter(cat => cat.id !== id));
        alert('Category deleted successfully');
      } catch (error) {
        alert('Failed to delete category');
      } finally {
        setIsLoading(false);
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
            <a href="index-2.html" className="text-decoration-none" 
  style={{ 
    color: '#4a7c87', 
  
  }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Categories</li>
        </ol>

        <button
          className="btn btn-success btn-sm"  style={{ 
            backgroundColor: '#D7A738',
          
          }}
          onClick={() => navigate('/admin/categories/add')}
        >
          <i className="bi bi-plus-circle me-1"></i> Add New Category
        </button>
        {/* Breadcrumb end */}

        {/* Sales stats start */}

        {/* Sales stats end */}

      </div>
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
                        Category Name
                      </th>
                      <th scope="col"></th>
                      <th scope="col">Description</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <th scope="row">
                        {category.nomCat}
                      </th>
                      <td></td>
                      <td>{category.descriptionCat} </td>
                      {/* <td>
                        <div className="progress small">
                          <div className="progress-bar" role="progressbar"  style={{ width: '75%' }} aria-valuenow="75"
                            aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td>$92,000</td> */}
                      <td>
                        <a className="btn btn-info btn-sm" style={{ marginRight: '10px' }}   onClick={() => navigate(`/admin/categories/edit/${category.id}`)} ><i className="bi bi-pencil"></i>
                        </a>
                        <a className="btn btn-danger btn-icon btn-sm" style={{ marginRight: '10px' }} onClick={() => handleDelete(category.id)}><i className="bi bi-trash"></i>
                        </a>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListAd;