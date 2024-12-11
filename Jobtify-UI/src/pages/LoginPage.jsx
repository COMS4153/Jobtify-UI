import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import '../css/LoginPage.css'; // 单独的CSS文件用于样式

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const user_service_url = 'http://13.58.61.231:8080';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${user_service_url}/api/users/login`, {
                username,
                password,
            });

            localStorage.setItem('UserID', JSON.stringify(response.data.id)); // 保存用户数据
            navigate(`/applications`); // 跳转到 applications 页面
        } catch (err) {
            setError('Invalid credentials, please try again.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;

            // 解码 ID token
            const decoded = jwtDecode(idToken);
            console.log('Google User:', decoded);

            // 发送 token 到后端
            const response = await axios.post(`${user_service_url}/api/users/google-login`, {
                idToken,
            });

            localStorage.setItem('UserID', JSON.stringify(response.data.userId));
            navigate(`/applications`);
        } catch (err) {
            console.error('Google Sign-In Failed:', err);
            setError('Google Sign-In failed. Please try again.');
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google Sign-In Failed:', error);
        setError('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <h1>Jobtify</h1>
                    <p>Career Growth with SMART Coach</p>
                </div>
                <div className="login-right">
                    <div className="card">
                        <h2 className="card-title">Login</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Login
                            </button>
                        </form>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            useOneTap
                            className="mt-3"
                        />
                        <button
                            className="btn-link"
                            onClick={() => navigate('/signup')}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
