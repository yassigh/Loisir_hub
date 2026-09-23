import React, { useState, useEffect } from 'react';
import { getAllCategories, deleteCategory } from '../../../services/categoryService';
import { useNavigate } from 'react-router-dom';


function CategoryListEn() {
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
          <li className="breadcrumb-item" aria-current="page">Categories</li>
        </ol>
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
  )
}

export default CategoryListEn