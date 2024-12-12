// src/services/applicationService.js
import axios from 'axios';

const API_BASE = 'http://18.118.161.48:8080/api';

export const getUserApplications = (userId, status = 'ALL') => {
  let url = `${API_BASE}/application/user/${userId}/applications`;
  if (status !== 'ALL') {
    url += `?status=${encodeURIComponent(status)}`;
  }
  return axios.get(url);
};

export const deleteApplication = (applicationId) => {
  return axios.delete(`${API_BASE}/application/applications/${applicationId}`);
};

export const updateApplication = (applicationId, data) => {
  const { status, notes, timeOfApplication } = data;
  const encodedNotes = encodeURIComponent(notes);
  const url = `${API_BASE}/application/applications/${applicationId}?status=${status}&notes=${encodedNotes}&timeOfApplication=${timeOfApplication}`;
  return axios.put(url);
};

export const addApplication = (applicationData) => {
  return axios.post(`${API_BASE}/application/applications`, applicationData);
};
