import React, { createContext, useState, useContext, useEffect } from 'react';
import { logout as apiLogout } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);

       useEffect(() => {
            const storedAuth = localStorage.getItem('isAuthenticated');
            if (storedAuth) {
               setIsAuthenticated(true);
            }
        }, [])

    const loginSuccess = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
          await apiLogout();
           localStorage.removeItem('isAuthenticated');
           setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    }


    return (
        <AuthContext.Provider value={{ isAuthenticated, loginSuccess, setIsAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);