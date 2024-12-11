import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user_service_url = 'http://13.58.61.231:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://13.58.61.231:8080/api/users/login', {
          username,
          password
        }
      );

      localStorage.setItem('UserID', JSON.stringify(response.data.id)); // Save user data
      // localStorage.setItem('applications', JSON.stringify(applications)); // Save applications
      navigate(`/applications`); // Navigate to applications page
    } catch (err) {
      setError('Invalid credentials, please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("credentialResponse: " + credentialResponse)
      console.log("credentialResponse.credential: " + credentialResponse.credential)
      const idToken = credentialResponse.credential;
      const decoded = jwtDecode(idToken);
      console.log('Google User:', decoded);
      
      // Send ID Token to backend for authentication and login
      const response = await axios.post(`${user_service_url}/api/users/google-login`, {
        idToken: idToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(response)

      // localStorage.setItem('UserID', JSON.stringify(response.data.id));
      // navigate(`/applications/${response.data.id}`);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError('Google Sign-In failed. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In Failed:', error);
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2>Login</h2>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
              <div className="text-center mt-3">
                <button
                  className="btn btn-link"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  className="mt-3 w-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
