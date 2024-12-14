import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import CustomToast from '../components/CustomToast';
import '../css/CustomCard.css'; // Import custom styles
import AgCoursesBox from '../components/AgCourseBox.jsx';
import AgCoursesItem from '../components/AgCoursesItem.jsx';
import CustomModal from '../components/CustomModal'; // Import CustomModal component
import useWindowWidth from '../hooks/useWindowWidth'; // Import custom hook
import SearchBar from '../components/SearchBar'; // Import SearchBar component
import { filterBySearchTerm } from '../utils/filterUtils'; // 导入过滤函数
import PaginationComponent from '../components/PaginationComponent'; // Import the new Pagination component

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [jobsPerPage, setJobsPerPage] = useState(6); // Number of jobs per page
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('UserID');
  const windowWidth = useWindowWidth(); // Get current window width

  // Add searchTerm state
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamically set jobsPerPage based on window width
  useEffect(() => {
    if (windowWidth >= 1200) {
      setJobsPerPage(6);
    } else if (windowWidth >= 992) {
      setJobsPerPage(4);
    } else if (windowWidth >= 768) {
      setJobsPerPage(3);
    } else {
      setJobsPerPage(1);
    }
    // Reset to first page when jobsPerPage changes
    setCurrentPage(1);
  }, [windowWidth]);

  // Reset currentPage to 1 when searchTerm changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://54.90.234.55:8080/api/jobs?size=100');
        setJobs(response.data.content);
      } catch (err) {
        setError('Error fetching jobs');
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  // Initialize map when modal is shown and a job is selected
  useEffect(() => {
    if (showModal && selectedJob) {
      initMap();
    }

    return () => {
      map = null;
    };
  }, [showModal, selectedJob]);

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNotes('');
  };

  const jobApplication = async () => {
    try {
      const timeOfApplication = new Date().toISOString();
      const applicationStatus = "applied";

      const response = await axios.post(
          `http://18.118.161.48:8080/api/application/${userId}/${selectedJob.jobId}/applications`,
          {
            timeOfApplication,
            applicationStatus,
            notes,
          }
      );

      if (response.status === 201) {
        console.log("Application created successfully!");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      if (error.response && error.response.status === 404) {
        alert("Please verify user id and job id are correct");
      }
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    await jobApplication();
    setTimeout(() => {
      setLoading(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      closeModal();
    }, 1500);
  };

  let map;

  async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.error("Map element not found");
      return;
    }

    const position = { lat: selectedJob.latitude, lng: selectedJob.longitude };
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
      zoom: 8,
      center: position,
      mapId: "DEMO_MAP_ID",
    });

    const marker = new AdvancedMarkerElement({
      map: map,
      position: position,
      title: "Job Location",
    });
  }

  const filteredJobs = filterBySearchTerm(
      jobs,
      searchTerm,
      ['title', 'company']
  );

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
      <div
          style={{
            backgroundColor: '#000',
            minHeight: '100vh',
            padding: '50px 0',
            width: '80%',
            margin: '50px auto'
          }}
      >
        <div
            className="d-flex justify-content-center align-items-center mb-4"
            style={{ gap: "20px", flexWrap: "wrap" }}
        >
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        <AgCoursesBox>
          {currentJobs.length === 0 && !error && (
              <div style={{ color: '#fff', marginBottom: '20px' }}>No jobs found.</div>
          )}
          {currentJobs.map((job) =>
                  job.publicView && (
                      <AgCoursesItem
                          key={job.jobId}
                          type="job"
                          data={job}
                          title={job.title}
                          onView={() => openModal(job)}
                      />
                  )
          )}
        </AgCoursesBox>

        <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
        />

        <CustomModal
            show={showModal}
            handleClose={closeModal}
            job={selectedJob}
            notes={notes}
            setNotes={setNotes}
            submitApplication={submitApplication}
            loading={loading}
        />

        <CustomToast
            show={showToast}
            message="Job has been marked as applied successfully."
            onClose={() => setShowToast(false)}
            bg="success"
        />
      </div>
  );
};

export default Jobs;
