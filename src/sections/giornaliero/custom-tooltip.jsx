import React from 'react';
import PropTypes from 'prop-types';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => {
            // Check if the payload entry name is 'contacts' to apply transformation
            const valueDisplay = (entry.name === 'contatti' ) 
              ? `${(entry.value / 1000).toLocaleString()} Milioni` // Apply x1000 transformation and append 'K'
              : entry.value.toLocaleString(); // Display as is for other data lines
            
            return (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {`${entry.name}: ${valueDisplay}`}
              </p>
            );
          })}
        </div>
      );
    }
  
    return null;
  };
CustomTooltip.propTypes = {
    active: PropTypes.any.isRequired,
    payload: PropTypes.any.isRequired,
    label: PropTypes.any.isRequired,
  };
  export default CustomTooltip;