import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null); // 选中的工作信息
  const [showModal, setShowModal] = useState(false); // 控制 Modal 的显示
  const [notes, setNotes] = useState(''); // Notes 文本
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false); // 控制 Spinner 的显示
  const navigate = useNavigate();

  const userId = localStorage.getItem('UserID')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://54.90.234.55:8080/api/jobs');
        setJobs(response.data.content); // 存储 "content" 数组中的所有 job 信息
      } catch (err) {
        setError('Error fetching jobs');
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job); // 设置选中的工作信息
    setShowModal(true); // 显示模态框
  };

  const closeModal = () => {
    setShowModal(false); // 关闭模态框
    setNotes(''); // 清空 Notes 字段
  };

  const jobApplication = async () => {
    try {
      // 设定申请的时间、状态和备注
      const timeOfApplication = new Date().toISOString();
      const applicationStatus = "applied";

      // 发送 POST 请求到后端 API
      const response = await axios.post(
        `http://localhost:8080/api/application/${userId}/${selectedJob.jobId}/applications`,
        {
          timeOfApplication,
          applicationStatus,
          notes,
        }
      );

      if (response.status === 201) {
        console.log("Application created successfully!");
        // 可在这里添加进一步的逻辑，例如展示通知
      }
    } catch (error) {
      console.error("Error creating application:", error);
      if (error.response && error.response.status === 404) {
        console.error("Invalid Input");
      }
    }
  };

  const submitApplication = async () => {
    setLoading(true); // 开始加载
    await jobApplication();
    setTimeout(() => {
      setLoading(false); // 停止加载
      setShowToast(true);
      setTimeout(() => {setShowToast(false)}, 3000);
      // navigate(`/applications/${userId}`)
      // 关闭模态框
      closeModal();
    }, 1500);
  };

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
          {jobs.map((job) => (
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
              <p><strong>Industry:</strong> {selectedJob.industry}</p>
              <div className="form-group">
                <label><strong>Notes:</strong></label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="5" // 设置为较高的高度以容纳更多文本
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
              "Confirm Apply"
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
