import React from 'react';

const MessageItem = ({ image, name, message, time }) => {
  return (
    <div className="dropdown-item">
      <div className="d-flex py-2 border-bottom">
        <img src={image} className="img-3x me-3 rounded-5" alt="Admin Theme" />
        <div className="m-0">
          <h6 className="mb-1 fw-semibold">{name}</h6>
          <p className="mb-1">{message}</p>
          <p className="small m-0 text-secondary">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;