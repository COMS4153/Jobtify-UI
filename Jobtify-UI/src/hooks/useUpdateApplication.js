// src/hooks/useUpdateApplication.js
import { useState } from 'react';
import axios from 'axios';
import config from "../config.js";

const useUpdateApplication = (applications, setApplications, closeViewModal) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const jobApplicationUpdate = async (selectedApplication, selectedStatus, notes) => {
    try {
      const timeOfApplication = new Date().toISOString().split('.')[0];
      const applicationStatus = selectedStatus;
      const encodedNotes = encodeURIComponent(notes);

      const url = `${config.APPLICATION_API_BASE_URL}/application/applications/${selectedApplication.applicationId}?status=${applicationStatus}&notes=${encodedNotes}&timeOfApplication=${timeOfApplication}`;
      const response = await axios.put(url);

      if (response.status === 200) {
        console.log("Application updated successfully!");
        const updatedApps = applications.map((app) =>
          app.applicationId === selectedApplication.applicationId
            ? { ...app, applicationStatus, notes }
            : app
        );
        setApplications(updatedApps);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      if (error.response && error.response.status === 404) {
        alert("Application not found. Please check the application ID.");
      }
    }
  };

  const updateApplicationHandler = async (selectedApplication, selectedStatus, notes) => {
    console.log(selectedApplication)
    setLoading(true);
    await jobApplicationUpdate(selectedApplication, selectedStatus, notes);
    setLoading(false);
    setShowUpdateToast(true);
    setTimeout(() => {
      setShowUpdateToast(false);
    }, 3000);
    closeViewModal();
  };

  return {
    updateApplicationHandler,
    loading,
    error,
    showUpdateToast,
    setShowUpdateToast
  };
};

export default useUpdateApplication;
