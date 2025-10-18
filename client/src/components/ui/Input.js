import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', ...props }) => {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
};

export default Input;
