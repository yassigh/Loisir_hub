import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initiatePayment, verifyPayment } from '../../../services/subscriptionService';
import { toast } from 'react-toastify';

const SubscriptionPaymentEn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startPayment();
  }, []);

  const startPayment = async () => {
    try {
      const response = await initiatePayment({ subscription_id: id });
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        toast.error('Failed to initiate payment');
        navigate('/enterprise/subscriptions');
      }
    } catch (error) {
      toast.error('Payment initiation failed');
      navigate('/enterprise/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Initializing payment...</p>
      </div>
    );
  }

  return null;
};

export default SubscriptionPaymentEn;