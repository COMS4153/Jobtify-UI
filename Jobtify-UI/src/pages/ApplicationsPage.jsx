import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // 确保引入Bootstrap样式
import { FaEye } from 'react-icons/fa'; // 引入图标库
import { Button, Spinner } from 'react-bootstrap';

const ApplicationsPage = () => {
  const { userId } = useParams();
  const [applications, setApplications] = useState([]);
  const [companyNames, setCompanyNames] = useState({});
  const [salary, setSalary] = useState({})
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loadingIds, setLoadingIds] = useState({}); // 跟踪哪个按钮在加载
  const navigate = useNavigate();

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

  const viewJobDetail = (applicationId) => {
    navigate(`/application/${applicationId}/job`);
  };

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
    }
  };

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
                  onClick={() => viewJobDetail(application.applicationId)}
                >
                  <FaEye className="me-1" /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      

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
