// src/hooks/useDeleteApplication.js
import { useState } from 'react';
import axios from 'axios';

const useDeleteApplication = (applications, setApplications) => {
  const [loadingIds, setLoadingIds] = useState({});
  const [error, setError] = useState('');
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const deleteApplication = async (applicationId) => {
    setLoadingIds((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await axios.delete(`http://18.118.161.48:8080/api/application/applications/${applicationId}`);
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
