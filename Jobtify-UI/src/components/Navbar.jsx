import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBriefcase, FaSuitcaseRolling, FaTachometerAlt, FaHome } from 'react-icons/fa';
import '../css/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const UserID = JSON.parse(localStorage.getItem('UserID'));

  const handleSignOut = () => {
    localStorage.removeItem('UserID');
    localStorage.removeItem('applications');
    navigate('/');
  };

  if (!UserID) return null;

  return (
    <nav className="vertical-navbar">
      <div className="navbar-brand">
        <FaHome className="brand-icon" />
        <span className="brand-text">Jobtify</span>
      </div>
      <div className="nav-container">
        <div className="nav-link">
          <Link to="/applications" className="nav-link-content">
            <FaSuitcaseRolling className="nav-icon" />
            <span className="nav-text">Applications</span>
          </Link>
        </div>
        <div className="nav-link">
          <Link to="/jobs" className="nav-link-content">
            <FaBriefcase className="nav-icon" />
            <span className="nav-text">Jobs</span>
          </Link>
        </div>
        <div className="nav-link">
          <Link to="/dashboard" className="nav-link-content">
            <FaTachometerAlt className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
        </div>
        <div className="nav-link">
          <button className="nav-link-content sign-out-button" onClick={handleSignOut}>
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
