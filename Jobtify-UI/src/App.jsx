import React from 'react';
import './App.css'; // 引入 CSS 文件
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ApplicationsPage from './pages/ApplicationsPage';
import JobDetailPage from './pages/JobDetailPage';
import Jobs from './pages/Jobs';

const App = () => {
  return (
    <Router>
      <Navbar /> {/* 添加导航栏组件 */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/applications/:userId" element={<ApplicationsPage />} />
        <Route path="/application/:applicationId/job" element={<JobDetailPage />} />
        <Route path="jobs" element={<Jobs />} />
      </Routes>
      <footer className="footer" style={{
          fontSize: '0.8rem',       // 调整字体大小
          padding: '0px',
          paddingTop: '10px',          // 调整内边距
          textAlign: 'center',      // 居中对齐文本
        }}>
        <p>© 2024 Jobtify by Scalable Dynamics(For COMSW 4153 - Cloud Computing). All rights reserved.</p>
      </footer>
    </Router>
  );
};


export default App;
