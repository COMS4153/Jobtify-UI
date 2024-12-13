// ApplicationsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import { FaEye, FaDollarSign, FaBuilding, FaCalendarAlt, FaStickyNote, FaLink } from 'react-icons/fa'; // Import additional icons
import { Button, Spinner } from 'react-bootstrap';
import AddApplicationModal from './AddApplicationModal';
import useFetchApplications from '../hooks/useFetchApplications';
import useJobDetails from '../hooks/useJobDetails';
import useDeleteApplication from '../hooks/useDeleteApplication';
import useAddApplication from '../hooks/useAddApplication';
import useUpdateApplication from '../hooks/useUpdateApplication';
import CustomToast from '../components/CustomToast';
import CustomModal from '../components/CustomModal';
import '../css/CustomCard.css'; // Ensure the CSS file is imported

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
  const [error, setError] = useState({});

  // Custom hooks
  const { applications, setApplications, titles, setTitles, companyNames, setCompanyNames, salary, setSalary, error: fetchApplicationError } = useFetchApplications(userId, filterStatus);
  const { selectedJob, setSelectedJob, error: fetchJobDetailError } = useJobDetails(selectedApplication);
  const { deleteApplication, loadingIds, error: applicationDeletionError, showDeleteToast, setShowDeleteToast } = useDeleteApplication(applications, setApplications);
  const { updateApplicationHandler, loading, error: applicationUpdateError, showUpdateToast, setShowUpdateToast } = useUpdateApplication(applications, setApplications, closeViewModal);

  // Combine fetchError to error
  useEffect(() => {
    setError((prevError) => ({
      ...prevError,
      applicationError: fetchApplicationError || null,
      jobDetailError: fetchJobDetailError || null,
      applicationDeletionError: applicationDeletionError || null,
      applicationUpdateError: applicationUpdateError || null,
    }));
  }, [fetchApplicationError, fetchJobDetailError, applicationDeletionError, applicationUpdateError]);

  useEffect(() => {
    setError({});
  }, [filterStatus]);

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
    <div style={{ backgroundColor: '#000', minHeight: '100vh', width: '80%', margin: '50px auto'}}>
      <h2 style={{ color: '#fff' }}>Your Applications</h2>

      <div className='mt-4 mb-4'
      style={{ display: "flex", alignItems: "center" }}>

        <Button onClick={openAddModal} className="btn btn-primary me-4 add-application-btn">
          Add Job Application
        </Button>

        <AddApplicationModal
          show={showAddModal}
          handleClose={closeAddModal}
          handleAddApplication={addApplication}
        />

        <div>
          <div className="btn-group dropend">
            <button
              type="button"
              className="btn btn-outline-warning dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Filter by Status: {filterStatus.toUpperCase()}
            </button>
            <ul className="dropdown-menu">
              {statuses.map((status) => (
                <li key={status}>
                  <button
                    className="dropdown-item"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {error.applicationError && <div className="alert alert-danger">{error.applicationError}</div>}
      {error.jobDetailError && <div className="alert alert-danger">{error.jobDetailError}</div>}
      {error.applicationDeletionError && <div className="alert alert-danger">{error.applicationDeletionError}</div>}
      {error.applicationUpdateError && <div className="alert alert-danger">{error.applicationUpdateError}</div>}

      <div className="ag-format-container">
        <div className="ag-courses_box">
          {applications.length === 0 && !error.applicationError && !error.jobDetailError && (
            <div style={{ color: '#fff', marginBottom: '20px' }}>No applications found.</div>
          )}
          {applications.map((application, index) => (
            <div className="ag-courses_item" key={application.applicationId}
            style={{cursor: "pointer"}}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openViewModal(application);
            }}>
              <div className="ag-courses-item_link" style={{ position: 'relative', zIndex: 2 }}>
                <div className="ag-courses-item_bg"></div>
                <div className="ag-courses-item_title" style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center' }}>
                  {companyNames[application.jobId] || 'Unavailable'}
                </div>
                <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
                  <strong><FaBuilding className="icon" style={{ marginRight: '5px' }} /> </strong>
                  <span className="ag-courses-text">
                    {titles[application.jobId] ? `${titles[application.jobId].toLocaleString()}` : 'Unknown'}
                  </span>
                </div>
                <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
                  <strong><FaDollarSign className="icon" style={{ marginRight: '5px' }} /> </strong>
                  <span className="ag-courses-text">
                    {salary[application.jobId] ? `$${salary[application.jobId].toLocaleString()}` : 'Unknown'}
                  </span>
                </div>
                <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
                  <strong><FaLink className='icon' style={{ marginRight: '5px' }} /> </strong>
                  <span className="ag-courses-text">
                    {application.applicationStatus.charAt(0).toUpperCase() + application.applicationStatus.slice(1)}
                  </span>
                </div>
                <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
                  <strong><FaCalendarAlt className="icon" style={{ marginRight: '5px' }} /> </strong>
                  <span className="ag-courses-text">{new Date(application.timeOfApplication).toLocaleDateString()}</span>
                </div>
                <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
                  <strong><FaStickyNote className="icon" style={{ marginRight: '5px' }} /> </strong>
                  <span className="ag-courses-text">{application.notes || 'None'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', position: 'relative', zIndex: 3 }}>
                  {/* <button
                    className="ag-courses-item_button"
                    style={{
                      backgroundColor: '#007bff',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      openViewModal(application);
                    }}
                  >
                    <FaEye style={{ marginRight: '5px' }} /> Update
                  </button> */}
                  <button
                    className="ag-courses-item_button"
                    style={{
                      backgroundColor: '#dc3545',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      deleteApplication(application.applicationId);
                    }}
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
                          style={{ marginRight: '5px' }}
                        /> Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
