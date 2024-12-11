import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const UserID = JSON.parse(localStorage.getItem('UserID')); // 从 localStorage 获取用户信息

  const handleSignOut = () => {
    localStorage.removeItem('UserID');
    localStorage.removeItem('applications');
    navigate('/');
  };

  // 只有在用户存在时才显示导航栏
  if (!UserID) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Jobtify</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to={`/applications`}>Applications</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/jobs">Jobs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleSignOut} style={{ cursor: 'pointer' }}>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
