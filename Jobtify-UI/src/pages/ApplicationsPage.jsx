import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库
import { Modal, Button, Spinner } from 'react-bootstrap';

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
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("Application Status");

  const [filterStatus, setFilterStatus] = useState('ALL');

  const navigate = useNavigate();

  // 封装获取applications的函数，方便更新后重新调用
  const fetchApplications = async () => {
    if (!userId) return;

    try {
      let url = `http://18.118.161.48:8080/api/application/user/${userId}/applications`;
      if (filterStatus !== 'ALL') {
        url += `?status=${encodeURIComponent(filterStatus)}`;
      }

      const response = await axios.get(url);
      setApplications(response.data);

      // 获取所有 jobIds
      const jobIds = response.data.map((app) => app.jobId);
      const jobRequests = jobIds.map((jobId) =>
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
      setError(''); // 清空error，因为成功获取数据
    } catch (err) {
      // 若后端返回404等情况，需要进行判断
      if (err.response && err.response.status === 404) {
        // 说明没有应用
        setApplications([]);
        setCompanyNames({});
        setSalary({});
        setError('No applications found for the current filter.');
      } else {
        setError('Error fetching applications.');
      }
    }
  };

  // 当 userId 或 filterStatus 改变时重新获取applications
  useEffect(() => {
    fetchApplications();
  }, [userId, filterStatus]);

  useEffect(() => {
    if (showModal && selectedApplication && selectedJob) {
      initMap();
    }
    return () => {
      map = null;
    };
  }, [showModal, selectedApplication, selectedJob]);

  useEffect(() => {
    if (selectedApplication) {
      jobDetailFetch();
    }
  }, [selectedApplication]);

  const openModal = (application) => {
    setSelectedApplication(application);
    setSelectedStatus(application.applicationStatus);
    setNotes(application.notes);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNotes('');
  };

  const deleteApplication = async (applicationId) => {
    setLoadingIds((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await axios.delete(`http://18.118.161.48:8080/api/application/applications/${applicationId}`);
      // 删除本地的application
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
        // 更新本地状态中的applications，让前端立即显示最新状态
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

  const updateApplication = async () => {
    setLoading(true);
    await jobApplicationUpdate();
    setLoading(false);
    setShowUpdateToast(true);
    setTimeout(() => { setShowUpdateToast(false); }, 3000);
    closeModal();
  };

  let map;

  async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement || !selectedJob) {
      console.error("Map element or selectedJob not found");
      return;
    }

    const position = { lat: selectedJob.latitude, lng: selectedJob.longitude };
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(mapElement, {
      zoom: 8,
      center: position,
      mapId: "DEMO_MAP_ID",
    });

    new AdvancedMarkerElement({
      map: map,
      position: position,
      title: selectedJob.company,
    });
  }

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
                  <strong>Annual Salary:</strong> {salary[application.jobId] ? salary[application.jobId] : 'Unknown'} 
                  <br/>
                  <strong>Status:</strong> {application.applicationStatus} 
                  <br/>
                  <strong>Application time:</strong> {application.timeOfApplication} 
                  <br/>
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
                  onClick={() => openModal(application)}
                >
                  <FaEye className="me-1" /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              <a href={selectedJob.jobLink} target="_blank" rel="noopener noreferrer"><strong>Application Link</strong></a>
              <hr/>
              <div className="form-group">
                <div className="btn-group">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-warning dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Status: {selectedStatus}
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("applied")}>applied</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("interviewing")}>interviewing</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("offered")}>offered</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("archived")}>archived</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("screening")}>screening</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("rejected")}>rejected</a></li>
                      <li><a className="dropdown-item" href="#" onClick={() => setSelectedStatus("withdraw")}>withdraw</a></li>
                    </ul>
                  </div>
                </div>
                <br /><br />
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
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button variant="primary" onClick={updateApplication} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Updating...
              </>
            ) : (
              "Confirm Update"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Delete Toast */}
      <div
        className={`toast position-fixed bottom-0 end-0 p-3 ${showDeleteToast ? 'show' : 'hide'}`}
        style={{ zIndex: 5 }}
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
          Application has been updated successfully.
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
