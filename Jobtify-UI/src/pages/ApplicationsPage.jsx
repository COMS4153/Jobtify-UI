import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库
import { Button, Spinner } from 'react-bootstrap';
import AddApplicationModal from './AddApplicationModal'; // 引入新的组件
import useFetchApplications from '../hooks/useFetchApplications';
import useJobDetails from '../hooks/useJobDetails';
import useDeleteApplication from '../hooks/useDeleteApplication';
import useAddApplication from '../hooks/useAddApplication';
import useUpdateApplication from '../hooks/useUpdateApplication';
import CustomToast from '../components/CustomToast';
import CustomModal from '../components/CustomModal';
//import './ApplicationsPage.css';

const ApplicationsPage = () => {
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem('UserID');
    return storedUserId ? JSON.parse(storedUserId) : '';
  });

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("Application Status");
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();
  const [error, setError] = useState({})

  // use custom hooks
  const { applications, setApplications, companyNames, setCompanyNames, salary, setSalary, error: fetchApplicationError } = useFetchApplications(userId, filterStatus)
  const { selectedJob, setSelectedJob, error: fetchJobDetailError } = useJobDetails(selectedApplication)
  const { deleteApplication, loadingIds, error: applicationDeletionError, showDeleteToast, setShowDeleteToast } = useDeleteApplication(applications, setApplications)
  const { updateApplicationHandler, loading, error: applicationUpdateError, showUpdateToast, setShowUpdateToast } = useUpdateApplication(applications, setApplications, closeViewModal)

  // Combine fetchError to error
  useEffect(() => {
    setError((prevError) => ({
      ...prevError,
      applicationError: fetchApplicationError || null,
      jobDetailError: fetchJobDetailError || null,
      applicationDeletionError: applicationDeletionError || null,
      applicationUpdateError: applicationUpdateError || null,
    }))
  }, [fetchApplicationError, fetchJobDetailError]);

  useEffect(() => {
    setError({});
  }, [filterStatus])

  useEffect(() => {
    if (showViewModal && selectedApplication && selectedJob) {
      // The map initialization is now handled inside ApplicationViewModal
    }
    return () => {
      // Cleanup if necessary
    };
  }, [showViewModal, selectedApplication, selectedJob]);

  const openViewModal = (application) => {
    setSelectedApplication(application);
    setSelectedStatus(application.applicationStatus);
    setNotes(application.notes);
    setShowViewModal(true);
  };

  function closeViewModal() {
    setShowViewModal(false);
    setNotes('');
    setSelectedApplication(null);
    setSelectedJob(null);
  }

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
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

        {error.applicationError && <div className="alert alert-danger">{error.applicationError}</div>}
        {error.jobDetailError && <div className="alert alert-danger">{error.jobDetailError}</div>}
        {error.applicationDeletionError && <div className="alert alert-danger">{error.applicationDeletionError}</div>}
        {error.applicationUpdateError && <div className="alert alert-danger">{error.applicationUpdateError}</div>}

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

        {/* Custom Modal */}
        <CustomModal
            show={showViewModal}
            handleClose={closeViewModal}
            job={selectedJob}
            notes={notes}
            setNotes={setNotes}
            setStatus={setSelectedStatus}
            submitApplication={() => {
              updateApplicationHandler(selectedApplication, selectedStatus, notes)
            }}
            loading={loading}
            showDropdown={true}
            dropdownOptions={statuses}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
        />

        {/* Custom Toasts */}
        <CustomToast
          show={showDeleteToast}
          message="Application has been deleted successfully."
          onClose={() => setShowDeleteToast(false)}
        />
        <CustomToast
          show={showUpdateToast}
          message="Application has been updated successfully."
          onClose={() => setShowUpdateToast(false)}
        />
      </div>
  );
};

export default ApplicationsPage;
