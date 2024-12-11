import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库
import { Button, Spinner } from 'react-bootstrap';
import ApplicationViewModal from './ApplicationViewModal'; // 引入新的组件
import AddApplicationModal from './AddApplicationModal'; // 引入新的组件
//import './ApplicationsPage.css';

const ApplicationsPage = () => {
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem('UserID');
    return storedUserId ? JSON.parse(storedUserId) : '';
  });

  const [applications, setApplications] = useState([]);
  const [companyNames, setCompanyNames] = useState({});
  const [salary, setSalary] = useState({});
  const [error, setError] = useState('');

  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const [loadingIds, setLoadingIds] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("Application Status");

  const [filterStatus, setFilterStatus] = useState('ALL');

  const navigate = useNavigate();

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
      const uniqueJobIds = [...new Set(jobIds)]; // Ensure unique jobIds to prevent redundant requests
      const jobRequests = uniqueJobIds.map((jobId) =>
          axios.get(`http://54.90.234.55:8080/api/jobs/${jobId}`)
              .then((res) => ({ jobId, companyName: res.data.company, salary: res.data.salary }))
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

      setCompanyNames(namesMapping);
      setSalary(salariesMapping);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setApplications([]);
        setCompanyNames({});
        setSalary({});
        setError('No applications found for the current filter.');
      } else {
        setError('Error fetching applications.');
      }
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterStatus]);

  useEffect(() => {
    if (showViewModal && selectedApplication && selectedJob) {
      // The map initialization is now handled inside ApplicationViewModal
    }
    return () => {
      // Cleanup if necessary
    };
  }, [showViewModal, selectedApplication, selectedJob]);

  useEffect(() => {
    if (selectedApplication) {
      jobDetailFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplication]);

  const openViewModal = (application) => {
    setSelectedApplication(application);
    setSelectedStatus(application.applicationStatus);
    setNotes(application.notes);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setNotes('');
    setSelectedApplication(null);
    setSelectedJob(null);
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const deleteApplication = async (applicationId) => {
    setLoadingIds((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await axios.delete(`http://18.118.161.48:8080/api/application/applications/${applicationId}`);
      setApplications(applications.filter((app) => app.applicationId !== applicationId));
      setShowDeleteToast(true);
      setTimeout(() => { setShowDeleteToast(false); }, 3000);
    } catch (err) {
      setError('Error deleting application');
      if (err.response && err.response.status === 404) {
        alert("Application not found");
      }
    } finally {
      setLoadingIds((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const jobDetailFetch = async () => {
    try {
      const res = await axios.get(`http://54.90.234.55:8080/api/jobs/${selectedApplication.jobId}`);
      setSelectedJob(res.data);
    } catch (err) {
      console.error(`Failed to fetch job detail for jobId ${selectedApplication.jobId}`, err);
      setError('Error fetching job detail.');
    }
  };

  const jobApplicationUpdate = async () => {
    try {
      const timeOfApplication = new Date().toISOString().split('.')[0];
      const applicationStatus = selectedStatus;
      const encodedNotes = encodeURIComponent(notes);

      const url = `http://18.118.161.48:8080/api/application/applications/${selectedApplication.applicationId}?status=${applicationStatus}&notes=${encodedNotes}&timeOfApplication=${timeOfApplication}`;
      const response = await axios.put(url);

      if (response.status === 200) {
        console.log("Application updated successfully!");
        // Update local state to reflect changes immediately
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

  const updateApplicationHandler = async () => {
    setLoading(true);
    await jobApplicationUpdate();
    setLoading(false);
    setShowUpdateToast(true);
    setTimeout(() => { setShowUpdateToast(false); }, 3000);
    closeViewModal();
  };

  const addApplication = async (newApplication) => {
    try {
      const response = await axios.post(`http://18.118.161.48:8080/api/application/applications`, {
        userId: userId,
        jobTitle: newApplication.jobTitle,
        company: newApplication.company,
        dateApplied: newApplication.dateApplied,
        status: newApplication.status
      });

      if (response.status === 201 || response.status === 200) {
        console.log("Application added successfully!");
        setApplications([...applications, response.data]);

        // Optionally fetch the updated companyNames and salary if jobId is part of response
        const jobId = response.data.jobId;
        if (jobId && !companyNames[jobId]) {
          try {
            const jobRes = await axios.get(`http://54.90.234.55:8080/api/jobs/${jobId}`);
            setCompanyNames(prev => ({ ...prev, [jobId]: jobRes.data.company }));
            setSalary(prev => ({ ...prev, [jobId]: jobRes.data.salary }));
          } catch (jobErr) {
            console.error(`Failed to fetch company details for jobId ${jobId}`, jobErr);
          }
        }

        setShowAddModal(false);
        setShowUpdateToast(true);
        setTimeout(() => { setShowUpdateToast(false); }, 3000);
      }
    } catch (error) {
      console.error("Error adding application:", error);
      setError('Error adding new application.');
    }
  };

  const statuses = [
    'ALL',
    'saved',
    'applied',
    'withdraw',
    'offered',
    'rejected',
    'interviewing',
    'archived',
    'screening'
  ];

  return (
      <div className="container mt-5">
        <h2>Your Applications</h2>

        <Button onClick={openAddModal} className="btn btn-primary mb-4">
          Add Job Application
        </Button>

        {/* Add Application Modal */}
        <AddApplicationModal
            show={showAddModal}
            handleClose={closeAddModal}
            handleAddApplication={addApplication}
        />

        <div className="mb-3">
          <div className="btn-group dropend">
            <button
                type="button"
                className="btn btn-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
              Filter by Status: {filterStatus}
            </button>
            <ul className="dropdown-menu">
              {statuses.map((status) => (
                  <li key={status}>
                    <a
                        className="dropdown-item"
                        href="#"
                        onClick={() => setFilterStatus(status)}
                    >
                      {status}
                    </a>
                  </li>
              ))}
            </ul>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          {applications.length === 0 && !error && (
              <div className="col-12">
                <p>No applications found.</p>
              </div>
          )}
          {applications.map((application) => (
              <div className="col-md-4 mb-3" key={application.applicationId}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      Company: {companyNames[application.jobId] || 'Unavailable'}
                    </h5>
                    <p className="card-text">
                      <strong>Annual Salary:</strong> {salary[application.jobId] ? `$${salary[application.jobId].toLocaleString()}` : 'Unknown'}
                      <br />
                      <strong>Status:</strong> {application.applicationStatus}
                      <br />
                      <strong>Application time:</strong> {application.timeOfApplication}
                      <br />
                      <strong>Notes:</strong> {application.notes}
                    </p>
                    <Button
                        variant="danger"
                        className="float-end"
                        onClick={() => deleteApplication(application.applicationId)}
                        disabled={loadingIds[application.applicationId]}
                    >
                      {loadingIds[application.applicationId] ? (
                          <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            /> Deleting...
                          </>
                      ) : (
                          "Delete"
                      )}
                    </Button>
                    <button
                        className="btn btn-primary float-end me-2"
                        onClick={() => openViewModal(application)}
                    >
                      <FaEye className="me-1" /> View
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Application View Modal */}
        <ApplicationViewModal
            show={showViewModal}
            handleClose={closeViewModal}
            application={selectedApplication}
            job={selectedJob}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            notes={notes}
            setNotes={setNotes}
            updateApplication={updateApplicationHandler}
            loading={loading}
        />

        {/* Delete Toast */}
        <div
            className={`toast position-fixed bottom-0 end-0 p-3 ${showDeleteToast ? 'show' : 'hide'}`}
            style={{ zIndex: 1055 }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">Notification</strong>
            <button type="button" className="btn-close" onClick={() => setShowDeleteToast(false)}></button>
          </div>
          <div className="toast-body">
            Application has been deleted successfully.
          </div>
        </div>

        {/* Update Success Toast */}
        <div
            className={`toast position-fixed bottom-0 end-0 p-3 ${showUpdateToast ? 'show' : 'hide'}`}
            style={{ zIndex: 1055 }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">Notification</strong>
            <button type="button" className="btn-close" onClick={() => setShowUpdateToast(false)}></button>
          </div>
          <div className="toast-body">
            {showDeleteToast ? "Application has been deleted successfully." : "Application has been updated successfully."}
          </div>
        </div>
      </div>
  );
};

export default ApplicationsPage;
