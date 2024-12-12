// src/services/jobService.js
import axios from 'axios';

const API_BASE = 'http://54.90.234.55:8080/api';

export const getJobById = (jobId) => {
  return axios.get(`${API_BASE}/jobs/${jobId}`);
};

export const getJobs = (size = 100) => {
  return axios.get(`${API_BASE}/jobs?size=${size}`);
};

export const applyJob = (userId, jobId, applicationData) => {
  return axios.post(
    `http://18.118.161.48:8080/api/application/${userId}/${jobId}/applications`,
    applicationData
  );
};
