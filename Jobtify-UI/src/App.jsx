import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ApplicationsPage from './pages/ApplicationsPage';
import JobDetailPage from './pages/JobDetailPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/applications/:userId" element={<ApplicationsPage />} />
        <Route path="/application/:applicationId/job" element={<JobDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;
