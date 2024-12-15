// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // 导入样式
import AuthLayout from '../components/AuthLayout';
import AuthForm from '../components/AuthForm';
import config from '../config';
// import './SignUpPage.css'; // 保留或删除，根据需要

const SignUpPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dob, setDOB] = useState(null); // 初始为 null
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const username = `${firstName} ${lastName}`;
            const response = await axios.post(`${config.USER_API_BASE_URL}/users/register`, {
                username,
                email,
                password,
                // dob, // 包含生日字段
            });
            navigate('/');
        } catch (err) {
            setError('An error occurred during signup. Please try again.');
        }
    };

    return (
        <AuthLayout>
            <AuthForm
                title="Sign Up"
                onSubmit={handleSubmit}
                error={error}
                submitButtonText="Sign Up"
                footer={
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => navigate('/')}
                    >
                        Already have an account? Login
                    </button>
                }
            >
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Date of Birth</label>
                    <DatePicker
                        selected={dob}
                        onChange={(date) => setDOB(date)}
                        dateFormat="yyyy/MM/dd"
                        className="form-control"
                        required
                        placeholderText="Select a date"
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
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
            </AuthForm>
        </AuthLayout>
    );
};

export default SignUpPage;
