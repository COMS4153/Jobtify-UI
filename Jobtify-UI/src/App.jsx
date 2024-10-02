import React from 'react';
import './App.css'; // 引入 CSS 文件
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ApplicationsPage from './pages/ApplicationsPage';
import JobDetailPage from './pages/JobDetailPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/applications/:userId" element={<ApplicationsPage />} />
        <Route path="/application/:applicationId/job" element={<JobDetailPage />} />
      </Routes>
      <footer className="footer">
        <p>© 2024 Jobtify. All rights reserved.</p>
      </footer>
    </Router>
  );
};

export default App;
