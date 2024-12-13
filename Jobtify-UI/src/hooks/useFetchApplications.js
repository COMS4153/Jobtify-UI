// src/hooks/useFetchApplications.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchApplications = (userId, filterStatus) => {
  const [applications, setApplications] = useState([]);
  const [titles, setTitles] = useState({});
  const [companyNames, setCompanyNames] = useState({});
  const [salary, setSalary] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId) return;

      try {
        let url = `http://18.118.161.48:8080/api/application/user/${userId}/applications`;
        if (filterStatus !== 'ALL') {
          url += `?status=${encodeURIComponent(filterStatus)}`;
        }

        const response = await axios.get(url);
        setApplications(response.data);

        const jobIds = response.data.map((app) => app.jobId);
        const uniqueJobIds = [...new Set(jobIds)]; // 确保唯一的 jobIds 以避免重复请求
        const jobRequests = uniqueJobIds.map((jobId) =>
          axios
            .get(`http://54.90.234.55:8080/api/jobs/${jobId}`)
            .then((res) => ({ jobId, title: res.data.title, companyName: res.data.company, salary: res.data.salary }))
            .catch((err) => {
              console.error(`Failed to fetch company for jobId ${jobId}`, err);
              return null;
            })
        );

        const jobData = await Promise.all(jobRequests);
        const namesMapping = jobData.reduce((acc, curr) => {
          if (curr) acc[curr.jobId] = curr.companyName;
          return acc;
        }, {});
        const salariesMapping = {};
        jobData.forEach((data) => {
          if (data) {
            salariesMapping[data.jobId] = data.salary;
          }
        });
        const titlesMapping = {};
        jobData.forEach((data) => {
          if (data) {
            titlesMapping[data.jobId] = data.title;
          }
        });

        setCompanyNames(namesMapping);
        setSalary(salariesMapping);
        setTitles(titlesMapping)
        setError('');
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setApplications([]);
          setCompanyNames({});
          setSalary({});
          setError(`No applications found for the current filter - ${filterStatus}.`);
        } else {
          setError('Error fetching applications.');
        }
      }
    };

    fetchApplications();
  }, [userId, filterStatus]);

  return { applications, setApplications, titles, setTitles, companyNames, setCompanyNames, salary, setSalary, error };
};

export default useFetchApplications;
