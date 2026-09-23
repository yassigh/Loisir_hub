import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentFail() {
    const navigate = useNavigate();

    return (
        <div className="text-center mt-5">
          <h2 className="text-danger">Payment Failed</h2>
          <p>Sorry, your payment could not be processed.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/enterprise/subscriptions')}
          >
            Try Again
          </button>
        </div>
      );
    }
    

export default PaymentFail