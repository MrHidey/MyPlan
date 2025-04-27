import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setIsAdmin(true);
        scheduleAutoLogout(decoded.exp * 1000 - Date.now());
      } else {
        logout(); // Token expired
      }
    }
  }, []);

  let logoutTimer;

  const scheduleAutoLogout = (timeout) => {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      logout();
      window.location.href = '/login'; // Redirect to login page
    }, timeout);
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAdmin(true);

    const decoded = jwt_decode(token);
    const timeout = decoded.exp * 1000 - Date.now();
    scheduleAutoLogout(timeout);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setIsAdmin(false);
  };
  

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
