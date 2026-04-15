import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);

  if (!currentUser) {
    // Si no hay usuario, mandarlo al login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;