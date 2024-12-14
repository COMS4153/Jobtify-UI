// ApplicationsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import AddApplicationModal from './AddApplicationModal';
import useFetchApplications from '../hooks/useFetchApplications';
import useJobDetails from '../hooks/useJobDetails';
import useDeleteApplication from '../hooks/useDeleteApplication';
import useUpdateApplication from '../hooks/useUpdateApplication';
import CustomToast from '../components/CustomToast';
import CustomModal from '../components/CustomModal';
import AgCoursesBox from '../components/AgCourseBox.jsx';
import AgCoursesItem from '../components/AgCoursesItem.jsx';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import TimeFilter from '../components/TimeFilter';
import AddButton from '../components/AddButton';
import '../css/CustomCard.css'; // Ensure the CSS file is imported
import { filterBySearchTerm } from '../utils/filterUtils';

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
  const [searchTerm, setSearchTerm] = useState(''); // Added search term state
  const [timeFilter, setTimeFilter] = useState('ALL'); // Added time filter state
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
  }, [filterStatus, searchTerm, timeFilter]); // Added dependencies

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

  const timeFilters = [
    'ALL',
    'LAST_WEEK',
    'LAST_MONTH',
    'LAST_YEAR'
  ];

  // Prepare applications with details
  const applicationsWithDetails = applications.map(application => ({
    ...application,
    title: titles[application.jobId] || '',
    companyName: companyNames[application.jobId] || '',
  }));

  // Apply filterBySearchTerm
  const filteredApplications = filterBySearchTerm(
      applicationsWithDetails,
      searchTerm,
      ['title', 'companyName']
  ).filter(application => {
    // Filter by Status
    if (filterStatus !== 'ALL' && application.applicationStatus.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }

    // Filter by Time
    if (timeFilter !== 'ALL') {
      const applicationDate = new Date(application.timeOfApplication);
      const now = new Date();
      switch (timeFilter) {
        case 'LAST_WEEK':
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          if (applicationDate < lastWeek) return false;
          break;
        case 'LAST_MONTH':
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          if (applicationDate < lastMonth) return false;
          break;
        case 'LAST_YEAR':
          const lastYear = new Date();
          lastYear.setFullYear(now.getFullYear() - 1);
          if (applicationDate < lastYear) return false;
          break;
        default:
          break;
      }
    }

    return true;
  });

  return (
      <div style={{backgroundColor: '#000', minHeight: '100vh', width: '80%', margin: '50px auto'}}>
        <h2 style={{color: '#fff'}}>Your Applications</h2>

        <div
            className="d-flex justify-content-center align-items-center mb-4"
            style={{gap: "20px", flexWrap: "wrap"}}
        >
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <StatusFilter
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              statuses={statuses}
          />

          <TimeFilter
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              timeFilters={timeFilters}
          />

          <AddButton openAddModal={openAddModal} />
        </div>

        <AddApplicationModal
            show={showAddModal}
            handleClose={closeAddModal}
            handleAddApplication={addApplication}
        />

        {Object.values(error).map((errMsg, idx) => errMsg &&
            <div key={idx} className="alert alert-danger">{errMsg}</div>
        )}

        <AgCoursesBox>
          {filteredApplications.length === 0 && !error.applicationError && !error.jobDetailError && (
              <div style={{color: '#fff', marginBottom: '20px'}}>No applications found.</div>
          )}
          {filteredApplications.map((application) => (
              <AgCoursesItem
                  key={application.applicationId}
                  type="application"
                  companyName={application.companyName} // Updated
                  title={application.title} // Updated
                  salary={salary[application.jobId]}
                  status={application.applicationStatus}
                  date={application.timeOfApplication}
                  notes={application.notes}
                  onView={() => openViewModal(application)}
                  onDelete={() => deleteApplication(application.applicationId)}
                  loadingDelete={loadingIds[application.applicationId]}
              />
          ))}
        </AgCoursesBox>

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
