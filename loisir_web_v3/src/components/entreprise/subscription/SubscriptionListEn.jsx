import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubscriptionPlans } from '../../../services/subscriptionPlanService';
import { getCurrentSubscription, subscribeToplan, cancelSubscription } from '../../../services/subscriptionService';
import { ToastContainer, toast } from 'react-toastify';

const SubscriptionListEn = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        getAllSubscriptionPlans(),
        getCurrentSubscription()
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData.subscription);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await subscribeToplan({ plan_id: planId });
      if (response.subscription_id) {
        navigate(`/enterprise/subscription/payment/${response.subscription_id}`);
      }
    } catch (error) {
      toast.error('Failed to subscribe to plan');
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await cancelSubscription();
        toast.success('Subscription cancelled successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to cancel subscription');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fs-5 mb-0">Subscription Plans</h1>
          <p className="mb-0">Choose the right plan for your business</p>
        </div>
      </div>

      {currentSubscription && (
        <div className="alert alert-info mb-4">
          <h5>Current Subscription</h5>
          <p>Plan: {currentSubscription.plan.name}</p>
          <p>Status: {currentSubscription.status}</p>
          <p>Expires: {new Date(currentSubscription.end_date).toLocaleDateString()}</p>
          {currentSubscription.status === 'active' && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      <div className="row">
        {plans.map((plan) => (
          <div key={plan.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header text-center">
                <h3 className="card-title">{plan.name}</h3>
                <h4 className="card-subtitle mb-2 text-muted">
                  {plan.price} TND / month
                </h4>
              </div>
              <div className="card-body">
                <p>{plan.description}</p>
                <ul className="list-unstyled">
                  <li>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    {plan.activities_limit} Activities
                  </li>
                  <li>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    {plan.events_limit} Events
                  </li>
                  <li>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    {plan.posts_limit} Posts
                  </li>
                  <li>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    {plan.ads_allowed ? 'Ads Allowed' : 'No Ads'}
                  </li>
                  <li>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    {plan.duration_in_days} Days
                  </li>
                </ul>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={currentSubscription?.status === 'active'}
                >
                  {currentSubscription?.status === 'active' 
                    ? 'Already Subscribed' 
                    : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default SubscriptionListEn;