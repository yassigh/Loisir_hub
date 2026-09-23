import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSubscriptionPlan } from '../../../services/subscriptionPlanService';

function AddSubscriptionPlanAd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_in_days: '',
    activities_limit: '',
    events_limit: '',
    posts_limit: '',
    ads_allowed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSubscriptionPlan(formData);
      navigate('/admin/subscriptionPlans');
    } catch (error) {
      console.error('Error adding subscription plan:', error);
    }
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fs-5 mb-0">Add Subscription Plan</h1>
          <p className="mb-0">Create a new subscription plan</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Duration (days)</label>
              <input
                type="number"
                className="form-control"
                name="duration_in_days"
                value={formData.duration_in_days}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Activities Limit</label>
              <input
                type="number"
                className="form-control"
                name="activities_limit"
                value={formData.activities_limit}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Events Limit</label>
              <input
                type="number"
                className="form-control"
                name="events_limit"
                value={formData.events_limit}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Posts Limit</label>
              <input
                type="number"
                className="form-control"
                name="posts_limit"
                value={formData.posts_limit}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="ads_allowed"
                checked={formData.ads_allowed}
                onChange={handleChange}
                id="adsAllowed"
              />
              <label className="form-check-label" htmlFor="adsAllowed">
                Ads Allowed
              </label>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                Create Plan
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/subscriptionPlans')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSubscriptionPlanAd;