import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 确保引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库

const ApplicationsPage = () => {
  const { userId } = useParams();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/user/${userId}/applications`);
        setApplications(response.data);
      } catch (err) {
        setError('Error fetching applications.');
      }
    };
    fetchApplications();
  }, [userId]);

  const viewJobDetail = (applicationId) => {
    navigate(`/application/${applicationId}/job`);
  };

  return (
    <div className="container mt-5">
      <h2>Your Applications</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        {applications.map((application) => (
          <div className="col-md-4 mb-3" key={application.applicationId}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Application ID: {application.applicationId}</h5>
                <p className="card-text">
                  <strong>Status:</strong> {application.applicationStatus}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => viewJobDetail(application.applicationId)}
                >
                  <FaEye className="me-1" /> View Job Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsPage;
