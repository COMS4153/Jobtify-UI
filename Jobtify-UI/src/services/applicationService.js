// src/services/applicationService.js
import axios from 'axios';
import config from '../config.js'


export const getUserApplications = (userId, status = 'ALL') => {
  let url = `${config.APPLICATION_API_BASE_URL}/application/user/${userId}/applications`;
  if (status !== 'ALL') {
    url += `?status=${encodeURIComponent(status)}`;
  }
  return axios.get(url);
};

export const deleteApplication = (applicationId) => {
  return axios.delete(`${config.APPLICATION_API_BASE_URL}/application/applications/${applicationId}`);
};

export const updateApplication = (applicationId, data) => {
  const { status, notes, timeOfApplication } = data;
  const encodedNotes = encodeURIComponent(notes);
  const url = `${config.APPLICATION_API_BASE_URL}/application/applications/${applicationId}?status=${status}&notes=${encodedNotes}&timeOfApplication=${timeOfApplication}`;
  return axios.put(url);
};

export const addApplication = (applicationData) => {
  return axios.post(`${config.APPLICATION_API_BASE_URL}/application/applications`, applicationData);
};
