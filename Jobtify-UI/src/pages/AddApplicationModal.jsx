import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AddApplicationModal = ({
                                 show,
                                 handleClose,
                                 handleAddApplication
                             }) => {
    const [formData, setFormData] = useState({
        jobTitle: '',
        company: '',
        dateApplied: '',
        status: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAddApplication(formData);
        setFormData({
            jobTitle: '',
            company: '',
            dateApplied: '',
            status: ''
        });
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Job Application</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="jobTitle" className="form-label">Job Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="jobTitle"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="company" className="form-label">Company</label>
                        <input
                            type="text"
                            className="form-control"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="dateApplied" className="form-label">Date Applied</label>
                        <input
                            type="date"
                            className="form-control"
                            id="dateApplied"
                            name="dateApplied"
                            value={formData.dateApplied}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="status" className="form-label">Status</label>
                        <input
                            type="text"
                            className="form-control"
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., applied, interviewing"
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleClose} className="me-2">
                            Cancel
                        </Button>
                        <Button variant="success" type="submit">
                            Save
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default AddApplicationModal;
