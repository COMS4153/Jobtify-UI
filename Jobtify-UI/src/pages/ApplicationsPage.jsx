import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

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
      <h2>Job Applications</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {applications.map((application) => (
          <li
            key={application.applicationId}
            className="list-group-item list-group-item-action"
            onClick={() => viewJobDetail(application.applicationId)}
            style={{ cursor: 'pointer' }}
          >
            <strong>Application ID:</strong> {application.applicationId} <br />
            <strong>Status:</strong> {application.applicationStatus}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicationsPage;
