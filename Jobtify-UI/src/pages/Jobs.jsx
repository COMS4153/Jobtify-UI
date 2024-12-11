import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [jobsPerPage] = useState(10); // Number of jobs per page
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem('UserID');

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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <h2>Job Listings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Company</th>
            <th>Title</th>
            <th>Description</th>
            <th>Salary</th>
            <th>Location</th>
            <th>Industry</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentJobs.map((job) => (
            job.publicView && (
              <tr key={job.jobId}>
                <td>{job.company}</td>
                <td>{job.title}</td>
                <td>{job.description}</td>
                <td>${job.salary.toLocaleString()}</td>
                <td>{job.location}</td>
                <td>{job.industry}</td>
                <td>
                  <button className="btn btn-success" onClick={() => openModal(job)}>
                    Apply
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: Math.ceil(jobs.length / jobsPerPage) }, (_, index) => (
            <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => paginate(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <p><strong>Company:</strong> {selectedJob.company}</p>
              <p><strong>Title:</strong> {selectedJob.title}</p>
              <p><strong>Description:</strong> {selectedJob.description}</p>
              <p><strong>Salary:</strong> ${selectedJob.salary.toLocaleString()}</p>
              <p><strong>Location:</strong> {selectedJob.location}</p>
              <div id="map"></div>
              <p><strong>Industry:</strong> {selectedJob.industry}</p>
              <a href={selectedJob.jobLink} target="_blank"><strong>Click here to apply!</strong></a>
              <hr></hr>
              <div className="form-group">
                <label><strong>Notes:</strong></label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="5"
                  placeholder="Enter your notes here..."
                ></textarea>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={submitApplication} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Applying...
              </>
            ) : (
              "Confirm Application"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <div
        className={`toast position-fixed bottom-0 end-0 p-3 ${showToast ? 'show' : 'hide'}`}
        style={{ zIndex: 5 }}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header">
          <strong className="me-auto">Notification</strong>
          <button type="button" className="btn-close" onClick={() => setShowToast(false)}></button>
        </div>
        <div className="toast-body">
          Job has been marked as applied successfully.
        </div>
      </div>
    </div>
  );
};

export default Jobs;