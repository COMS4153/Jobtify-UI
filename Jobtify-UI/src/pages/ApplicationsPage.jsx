import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 确保引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库

const ApplicationsPage = () => {
  const { userId } = useParams();
  const [applications, setApplications] = useState([]);
  const [companyNames, setCompanyNames] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // const response = await axios.get(`http://localhost:8080/api/application/user/${userId}/applications`);
        const response = await axios.get(`http://localhost:8080/api/application/user/1/applications`);
        setApplications(response.data);

        // 获取所有 jobIds 以便批量获取公司名称
        const jobIds = response.data.map((app) => app.job_id);

        // 为每个 jobId 获取公司名称
        const companyRequests = jobIds.map((jobId) =>
          axios.get(`http://localhost:8080/api/job/${jobId}`)
            .then((res) => ({ jobId, companyName: res.data.companyName }))
            .catch((err) => {
              console.error(`Failed to fetch company for jobId ${jobId}`, err);
              return null;
            })
        );

        const companyData = await Promise.all(companyRequests);
        const namesMapping = companyData.reduce((acc, curr) => {
          if (curr) acc[curr.jobId] = curr.companyName;
          return acc;
        }, {});
        
        setCompanyNames(namesMapping);
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
                {/* <h5 className="card-title">Application ID: {application.applicationId}</h5> */}
                <h5 className="card-title">Application ID: {application.applicationId}</h5>
                <h5 className="card-title">
                  {companyNames[application.job_id] || 'Loading...'}
                </h5>
                <p className="card-text">
                  <strong>Status:</strong> {application.applicationStatus} 
                  <br/>
                  <strong>Application time:</strong> {application.timeOfApplication} 
                  <br/>
                  <strong>Notes:</strong> {application.notes}
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
