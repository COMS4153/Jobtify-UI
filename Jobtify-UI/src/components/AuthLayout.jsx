// src/components/AuthLayout.jsx
import React from 'react';
import '../css/AuthLayout.css'; // 引入新的 CSS 文件

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h1>Jobtify</h1>
          <p>Career Growth with SMART Coach</p>
        </div>
        <div className="auth-right">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
