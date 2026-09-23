import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <div className="text-center mt-5">
          <h2 className="text-success">Payment Successful!</h2>
          <p>Your subscription has been activated successfully.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/enterprise/subscriptions')}
          >
            Return to Subscriptions
          </button>
        </div>
      );
    }
export default PaymentSuccess;