// src/hooks/useJobDetails.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useJobDetails = (selectedApplication) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!selectedApplication) return;

      try {
        const res = await axios.get(`http://54.90.234.55:8080/api/jobs/${selectedApplication.jobId}`);
        setSelectedJob(res.data);
        setError('');
      } catch (err) {
        console.error(`Failed to fetch job detail for jobId ${selectedApplication.jobId}`, err);
        setError('Error fetching job detail.');
      }
    };

    fetchJobDetails();
  }, [selectedApplication]);

  return { selectedJob, setSelectedJob, error };
};

export default useJobDetails;
