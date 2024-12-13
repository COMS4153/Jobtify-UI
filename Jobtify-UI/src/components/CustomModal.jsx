import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner, Row, Col, Badge, Dropdown } from 'react-bootstrap';
import { FaMapMarkerAlt, FaDollarSign, FaIndustry, FaBuilding, FaBriefcase, FaStickyNote, FaEllipsisV } from 'react-icons/fa';

const CustomModal = ({
  show,
  handleClose,
  job,
  notes,
  setNotes,
  setStatus,
  submitApplication,
  loading,
  showDropdown = false, // 控制是否显示下拉菜单
  dropdownOptions = [], // 下拉菜单选项
  selectedStatus,
  setSelectedStatus,
}) => {

  useEffect(() => {
    if (show && job) {
      initMap();
    }
    return () => {
      map = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, job]);

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

  return (
    <Modal show={show} onHide={handleClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Job Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {job && (
          <Row>
            <Col md={6}>
              <div id="map" style={{ height: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <FaBuilding className="me-2 text-primary" />
                <strong>Company:</strong> {job.company}
              </div>
              <div className="mb-3">
                <FaBriefcase className="me-2 text-success" />
                <strong>Title:</strong> {job.title}
              </div>
              <div className="mb-3">
                <FaDollarSign className="me-2 text-warning" />
                <strong>Salary:</strong> ${job.salary.toLocaleString()}
              </div>
              <div className="mb-3">
                <FaMapMarkerAlt className="me-2 text-danger" />
                <strong>Location:</strong> {job.location}
              </div>
              <div className="mb-3">
                <FaIndustry className="me-2 text-secondary" />
                <strong>Industry:</strong> {job.industry}
              </div>
              {showDropdown && (<div className="mb-3">
                <FaStickyNote className="me-2 text-info" />
                <strong>Notes:</strong> {job.notes}
              </div>)}
              <a href={job.jobLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary mb-3">
                <FaBriefcase className="me-2" /> Click here to apply!
              </a>
              <hr />
              {/* 可选的下拉菜单 */}
              {showDropdown && (
                <div className="mb-3">
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                      {selectedStatus}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {dropdownOptions.map((option, index) => (
                        <Dropdown.Item key={index} onClick={() => setSelectedStatus(option)}>
                          {option}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}
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
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={submitApplication} disabled={loading}>
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
  );
};

export default CustomModal;
