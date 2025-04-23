import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';


const Navbar = () => {
  const { isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully!');

  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">StudyNotes</Link>
      </div>
      <ul className="navbar-links">
        {!isAdmin ? (
          <>
            <li><Link to="/login">Admin Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
