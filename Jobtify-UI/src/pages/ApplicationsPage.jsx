import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 确保引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库
import { Modal, Button, Spinner, Dropdown } from 'react-bootstrap';

const ApplicationsPage = () => {
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem('UserID');
    return storedUserId ? JSON.parse(storedUserId) : '';
  });
  const [applications, setApplications] = useState([]);
  const [companyNames, setCompanyNames] = useState({});
  const [salary, setSalary] = useState({})
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loadingIds, setLoadingIds] = useState({}); // delete loading spinner
  const [selectedApplication, setSelectedApplication] = useState(null); // 选中的申请信息
  const [selectedJob, setSelectedJob] = useState(null); // 选中的工作信息
  const [showModal, setShowModal] = useState(false); // 控制 Modal 的显示
  const [loading, setLoading] = useState(false); // update loading spinner
  const [notes, setNotes] = useState(''); // Notes 文本
  const [selectedStatus, setSelectedStatus] = useState("Application Status");
  const navigate = useNavigate();

  // useEffect(() => {
  //   const storedUserId = localStorage.getItem('UserID');
  //   if (storedUserId) {
  //     setUserId(JSON.parse(storedUserId));
  //   }
  // }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`http://18.118.161.48:8080/api/application/user/${userId}/applications`);
        // const response = await axios.get(`http://localhost:8080/api/application/user/1/applications`);
        setApplications(response.data);

        console.log(response)

        // 获取所有 jobIds 以便批量获取公司名称
        const jobIds = response.data.map((app) => app.jobId);

        // 为每个 jobId 获取公司名称
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
      } catch (err) {
        setError('Error fetching applications.');
      }
    };
    fetchApplications();
  }, [userId]);

  useEffect(() => {
    if (showModal && selectedApplication && selectedJob) {
      initMap();
    }

    return () => {
      // Clean up code
      map = null;
    };
  }, [showModal, selectedApplication, selectedJob]);

  useEffect(() => {
    if (selectedApplication) {
      jobDetailFetch();
    }
  }, [selectedApplication]); // 当 selectedApplication 改变时运行  

  const openModal = (application) => {
    setSelectedApplication(application); // 设置选中的工作信息
    setSelectedStatus(application.applicationStatus)
    setNotes(application.notes);
    // jobDetailFetch();
    setShowModal(true); // 显示模态框
  };

  const closeModal = () => {
    setShowModal(false); // 关闭模态框
    setNotes(''); // 清空 Notes 字段
  };

  // const viewJobDetail = (applicationId) => {
  //   navigate(`/application/${applicationId}/job`);
  // };

  const deleteApplication = async (applicationId) => {
    // 设置当前 applicationId 的加载状态为 true
    setLoadingIds((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await axios.delete(`http://18.118.161.48:8080/api/application/applications/${applicationId}`);
      setApplications(applications.filter((app) => app.applicationId != applicationId));
      setShowToast(true);
      setTimeout(() => {setShowToast(false)}, 3000);
      setLoadingIds((prev) => ({ ...prev, [applicationId]: false }));
    } catch (err) {
      setError('Error deleting application');
      setLoadingIds((prev) => ({ ...prev, [applicationId]: false }));
      if (err.response && err.response.status === 404) {
        alert("Application not found");
      }
    }
  };

  const jobDetailFetch = async() => {
    try {
      await axios.get(`http://54.90.234.55:8080/api/jobs/${selectedApplication.jobId}`)
      .then((res) => {
        setSelectedJob(res.data)
      })
      .catch((err) => {
        console.error(`Failed to fetch company for jobId ${selectedApplication.jobId}`, err);
        return null;
      })
    } catch (err) {
      setError('Error fetching job detail');
    }
  }

  const jobApplicationUpdate = async () => {
    try {
      const timeOfApplication = new Date().toISOString();
      const applicationStatus = selectedStatus;
      console.log(applicationStatus)
  
      // 构造请求URL
      const url = `http://18.118.161.48:8080/api/application/applications/${selectedApplication.applicationId}?status=${applicationStatus}&notes=${notes}&timeOfApplication=${timeOfApplication}`;
      console.log(url);
      // 发送 PUT 请求到后端 API
      const response = await axios.put(url);
  
      if (response.status === 200) {
        console.log("Application updated successfully!");
        // 可在这里添加进一步的逻辑，例如展示通知
      }
    } catch (error) {
      console.error("Error updating application:", error);
      if (error.response && error.response.status === 404) {
        alert("Application not found. Please check the application ID.");
      }
    }
  };  

  const updateApplication = async () => {
    setLoading(true); // 开始加载
    await jobApplicationUpdate();
    setTimeout(() => {
      setLoading(false); // 停止加载
      setShowToast(true);
      setTimeout(() => {setShowToast(false)}, 3000);
      // navigate(`/applications/${userId}`)
      // 关闭模态框
      closeModal();
    }, 1500);
  };

  // Initialize and add the map
  let map;

  async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.error("Map element not found");
      return;
    }

    // The location of Uluru
    const position = { lat: selectedJob.latitude, lng: selectedJob.longitude };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
      zoom: 8,
      center: position,
      mapId: "DEMO_MAP_ID",
    });

    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerElement({
      map: map,
      position: position,
      title: "Uluru",
    });
  }

  return (
    <div className="container mt-5">
      <h2>Your Applications</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {/* <button onClick={() => testToast()}>toast</button> */}
      <div className="row">
        {applications.map((application) => (
          <div className="col-md-4 mb-3" key={application.applicationId}>
            <div className="card shadow-sm">
              <div className="card-body">
                {/* <h5 className="card-title">Application ID: {application.applicationId}</h5> */}
                {/* <h5 className="card-title">Application ID: {application.applicationId}</h5> */}
                {/* <h5 className="card-title">Job ID: {application.jobId}</h5> */}
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
                  disabled={loadingIds[application.applicationId]} // 检查当前按钮是否加载中
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
              <a href={selectedJob.jobLink} target="_blank"><strong>Application Link</strong></a>
              <hr></hr>
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
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("applied")}>
                          applied
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("interviewing")}>
                          interviewing
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("offered")}>
                          offered
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("archived")}>
                          archived
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("screening")}>
                          screening
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("rejected")}>
                          rejected
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" onClick={() => setSelectedStatus("withdraw")}>
                          withdraw
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <br></br>
                <br></br>
                <label><strong>Notes:</strong></label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="5" 
                  placeholder="Enter your notes here..."
                > {selectedApplication.notes} </textarea>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={updateApplication} disabled={loading}>
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
              "Confirm Update"
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
          Application has been deleted successfully.
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
