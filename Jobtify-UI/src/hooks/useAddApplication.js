// src/hooks/useAddApplication.js
import { useState } from 'react';
import axios from 'axios';
import config from '../config.js'

const useAddApplication = (userId, applications, setApplications) => {
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const addApplication = async (newApplication) => {
    try {
      const response = await axios.post(`${config.APPLICATION_API_BASE_URL}/application/applications`, {
        userId: userId,
        jobTitle: newApplication.jobTitle,
        company: newApplication.company,
        dateApplied: newApplication.dateApplied,
        status: newApplication.status
      });

      if (response.status === 201 || response.status === 200) {
        console.log("Application added successfully!");
        setApplications([...applications, response.data]);

        // 可选：如果响应中包含 jobId，则获取公司名称和薪资
        const jobId = response.data.jobId;
        if (jobId && !applications.some(app => app.jobId === jobId)) {
          try {
            const jobRes = await axios.get(`${config.JOB_API_BASE_URL}/jobs/${jobId}`);
            // 假设存在 setCompanyNames 和 setSalary 的方法
            // 需要在主组件中处理
          } catch (jobErr) {
            console.error(`Failed to fetch company details for jobId ${jobId}`, jobErr);
          }
        }

        setShowAddModal(false);
        setShowUpdateToast(true);
        setTimeout(() => {
          setShowUpdateToast(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error adding application:", error);
      setError('Error adding new application.');
    }
  };

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  return {
    addApplication,
    error,
    showAddModal,
    setShowAddModal,
    openAddModal,
    closeAddModal,
    showUpdateToast,
    setShowUpdateToast
  };
};

export default useAddApplication;
