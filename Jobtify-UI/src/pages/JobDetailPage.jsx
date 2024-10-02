import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const JobDetailPage = () => {
  const { applicationId } = useParams();
  const [jobDetail, setJobDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/application/${applicationId}/job`);
        setJobDetail(response.data);
      } catch (err) {
        setError('Error fetching job details.');
      }
    };

    fetchJobDetail();
  }, [applicationId]);

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger">{error}</div>}
      {jobDetail && (
        <div className="card">
          <div className="card-header">
            <h2>{jobDetail.jobTitle}</h2>
          </div>
          <div className="card-body">
            <p><strong>Company:</strong> {jobDetail.company}</p>
            <p><strong>Description:</strong> {jobDetail.description}</p>
            <p><strong>Location:</strong> {jobDetail.officeLocation}</p>
            <p><strong>Salary:</strong> ${jobDetail.minSalary} - ${jobDetail.maxSalary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
