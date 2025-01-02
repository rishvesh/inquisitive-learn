import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated, store location for redirection
        return <Navigate to="/login" state={{ from: location }} />;
    }
    // Render children if authenticated
    return children;
};