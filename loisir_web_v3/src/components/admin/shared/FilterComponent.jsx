import React from 'react';
import PropTypes from 'prop-types';

const FilterComponent = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-container mb-3">
      <div className="row g-3">
        {filters.map(filter => (
          <div key={filter.name} className="col-md-3">
            <label className="form-label">{filter.label}</label>
            <select 
              className="form-select"
              name={filter.name}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
            >
              <option value="">All {filter.label}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

FilterComponent.propTypes = {
  filters: PropTypes.arrayOf(
      PropTypes.shape({
          name: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          options: PropTypes.arrayOf(
              PropTypes.shape({
                  value: PropTypes.string.isRequired,
                  label: PropTypes.string.isRequired
              })
          ).isRequired
      })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired
};


export default FilterComponent;