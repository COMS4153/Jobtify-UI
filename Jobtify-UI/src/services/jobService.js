// src/services/jobService.js
import axios from 'axios';
import config from '../config.js'

export const getJobById = (jobId) => {
  return axios.get(`${config.JOB_API_BASE_URL}/jobs/${jobId}`);
};

export const getJobs = (size = 100) => {
  return axios.get(`${config.JOB_API_BASE_URL}/jobs?size=${size}`);
};

export const applyJob = (userId, jobId, applicationData) => {
  return axios.post(
    `${config.APPLICATION_API_BASE_URL}/application/${userId}/${jobId}/applications`,
    applicationData
  );
};
