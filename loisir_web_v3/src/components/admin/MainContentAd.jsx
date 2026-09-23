//src/componenrs/admin/MainContentAd.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';


const MainContentAd = ({ children }) => {
    useEffect(() => {
        if (window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons();
        }
      }, []);
    return (
      <div className="app-container">
       {children}
      </div>
    );
};
MainContentAd.propTypes = {
    children: PropTypes.node
};

export default MainContentAd;