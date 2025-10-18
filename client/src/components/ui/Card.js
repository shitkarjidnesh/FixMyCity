import React from 'react';

const Card = ({ children, className = '' }) => {
  const baseStyles = 'bg-white shadow-md rounded-lg overflow-hidden';

  return (
    <div className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
