// src/pages/Jobs.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Spinner, Card, Row, Col, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaDollarSign, FaIndustry, FaBuilding, FaBriefcase, FaStickyNote } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomToast from '../components/CustomToast';
import '../css/CustomCard.css'; // 引入自定义样式
import AgCoursesBox from '../components/AgCourseBox.jsx';
import AgCoursesItem from '../components/AgCoursesItem.jsx';
import CustomModal from '../components/CustomModal'; // 引入新的模态框组件
import useWindowWidth from '../hooks/useWindowWidth'; // 引入自定义钩子

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
  const windowWidth = useWindowWidth(); // 获取当前窗口宽度

  // 动态设置 jobsPerPage
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
  }, [windowWidth]);

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
      title: "Uluru",
    });
  }

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];

    for (let number = 1; number <= totalPages; number++) {
      pageNumbers.push(
        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              paginate(number);
            }}
          >
            {number}
          </a>
        </li>
      );
    }

    return (
      <nav aria-label="Page navigation example">
        <ul className="pagination pagination-lg justify-content-center">
          {/* Previous Button */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a
              className="page-link"
              href="#"
              aria-label="Previous"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) paginate(currentPage - 1);
              }}
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>

          {/* Page Numbers */}
          {pageNumbers}

          {/* Next Button */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a
              className="page-link"
              href="#"
              aria-label="Next"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) paginate(currentPage + 1);
              }}
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    );
  };

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
        {renderPagination()}

        <AgCoursesBox>
          {currentJobs.map((job) =>
                  job.publicView && (
                      <AgCoursesItem
                          key={job.jobId}
                          type="job"
                          data={job}
                          title={job.title}
                          onView={() => openModal(job)}
                      >
                      </AgCoursesItem>
                  )
          )}
        </AgCoursesBox>

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
