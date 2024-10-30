import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://54.90.234.55:8080/api/jobs');
        setJobs(response.data.content); // 存储 "content" 数组中的所有 job 信息
      } catch (err) {
        setError('Error fetching jobs');
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Job Listings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Company</th>
            <th>Title</th>
            <th>Description</th>
            <th>Salary</th>
            <th>Location</th>
            <th>Industry</th>
            <th>Public View</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.jobId}>
              <td>{job.jobId}</td>
              <td>{job.company}</td>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>${job.salary.toLocaleString()}</td>
              <td>{job.location}</td>
              <td>{job.industry}</td>
              <td>{job.publicView ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Jobs;
