// src/hooks/useDeleteApplication.js
import { useState } from 'react';
import axios from 'axios';
import config from '../config.js'

const useDeleteApplication = (applications, setApplications) => {
  const [loadingIds, setLoadingIds] = useState({});
  const [error, setError] = useState('');
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const deleteApplication = async (applicationId) => {
    setLoadingIds((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await axios.delete(`${config.APPLICATION_API_BASE_URL}/application/applications/${applicationId}`);
      setApplications(applications.filter((app) => app.applicationId !== applicationId));
      setShowDeleteToast(true);
      setTimeout(() => {
        setShowDeleteToast(false);
      }, 3000);
    } catch (err) {
      setError('Error deleting application');
      if (err.response && err.response.status === 404) {
        alert("Application not found");
      }
    } finally {
      setLoadingIds((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  return { deleteApplication, loadingIds, error, showDeleteToast, setShowDeleteToast };
};

export default useDeleteApplication;
