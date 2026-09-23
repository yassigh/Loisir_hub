import React from 'react';

const Dropdown = ({ icon, label, countLabel, content }) => {
  return (
    <div className="dropdown">
      <a className="dropdown-toggle d-flex px-3 py-4 position-relative" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i className={`bi ${icon} fs-4 lh-1 text-secondary`}></i>
        {countLabel && <span className={`count-label ${countLabel}`}></span>}
      </a>
      <div className="dropdown-menu dropdown-menu-end shadow-lg">
        {content}
      </div>
    </div>
  );
};

export default Dropdown;