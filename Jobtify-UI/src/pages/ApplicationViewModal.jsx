import React, { useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ApplicationViewModal = ({
  show,
  handleClose,
  application,
  job,
  selectedStatus,
  setSelectedStatus,
  notes,
  setNotes,
  updateApplication,
  loading
}) => {

  useEffect(() => {
    if (show && application && job) {
      initMap();
    }
    return () => {
      if (window.google && window.google.maps) {
        // Cleanup if necessary
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, application, job]);

  let map;

  async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement || !job) {
      console.error("Map element or job data not found");
      return;
    }

    const position = { lat: job.latitude, lng: job.longitude };
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
      title: job.company,
    });
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Job Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {job && (
          <>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Title:</strong> {job.title}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Salary:</strong> ${job.salary.toLocaleString()}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <div id="map" style={{ height: '300px', width: '100%' }}></div>
            <p><strong>Industry:</strong> {job.industry}</p>
            <a href={job.jobLink} target="_blank" rel="noopener noreferrer"><strong>Application Link</strong></a>
            <hr />
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
                    {[
                      "applied",
                      "interviewing",
                      "offered",
                      "archived",
                      "screening",
                      "rejected",
                      "withdraw"
                    ].map((status) => (
                      <li key={status}>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => handleStatusChange(status)}
                        >
                          {status}
                        </a>
                      </li>
                    ))}
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
        <Button variant="secondary" onClick={handleClose}>Close</Button>
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
  );
};

export default ApplicationViewModal;
