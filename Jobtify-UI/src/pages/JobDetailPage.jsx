import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 确保引入Bootstrap样式
import { FaBuilding, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa'; // 引入 Font Awesome 图标

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
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h2>{jobDetail.jobTitle}</h2>
          </div>
          <div className="card-body">
            <p className="card-text">
              <FaBuilding className="me-2" />
              <strong>Company:</strong> {jobDetail.company}
            </p>
            <p className="card-text">
              <FaMapMarkerAlt className="me-2" />
              <strong>Location:</strong> {jobDetail.officeLocation}
            </p>
            <p className="card-text">
              <strong>Description:</strong> {jobDetail.description}
            </p>
            <p className="card-text">
              <FaDollarSign className="me-2" />
              <strong>Salary:</strong> ${jobDetail.minSalary} - ${jobDetail.maxSalary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
