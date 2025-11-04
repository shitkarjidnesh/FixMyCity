import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admintoken');
    if (!token) {
      navigate('/login');
    } else {
      // Optional: decode token to check for expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('admintoken');
          navigate('/login');
        }
      } catch (e) {
        localStorage.removeItem('admintoken');
        navigate('/login');
      }
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthGuard;
