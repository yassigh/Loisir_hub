//src/componenrs/admin/MainContentEn.jsx
import PropTypes from 'prop-types';
import React from 'react';


const MainContentEn = ({ children }) => {

    return (
      <div className="app-container">
      {children}
     </div>
   );
};
MainContentEn.propTypes = {
    children: PropTypes.node
};

export default MainContentEn;