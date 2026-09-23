import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubscriptionPlans, deleteSubscriptionPlan } from '../../../services/subscriptionPlanService';

const SubscriptionPlanListAd = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getAllSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteSubscriptionPlan(id);
        setPlans(plans.filter(plan => plan.id !== id));
        alert('Plan deleted successfully');
      } catch (error) {
        alert('Failed to delete plan');
      }
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start justify-content-between">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{ color: '#4a7c87' }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{ color: '#4a7c87' }}>Home</a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Subscription Plans</li>
        </ol>

        <button
          className="btn btn-success btn-sm"
          style={{ backgroundColor: '#D7A738' }}
          onClick={() => navigate('/admin/subscriptionPlans/add')}
        >
          <i className="bi bi-plus-circle me-1"></i> Add New Plan
        </button>
      </div>

      <div className="row gx-3">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Duration (Days)</th>
                      <th>Activities Limit</th>
                      <th>Events Limit</th>
                      <th>Posts Limit</th>
                      <th>Ads Allowed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.name}</td>
                        <td>${plan.price}</td>
                        <td>{plan.duration_in_days}</td>
                        <td>{plan.activities_limit}</td>
                        <td>{plan.events_limit}</td>
                        <td>{plan.posts_limit}</td>
                        <td>{plan.ads_allowed ? 'Yes' : 'No'}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => navigate(`/admin/subscriptionPlans/edit/${plan.id}`)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

export default SubscriptionPlanListAd;