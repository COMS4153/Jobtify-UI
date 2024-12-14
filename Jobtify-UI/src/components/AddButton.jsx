import React from 'react';
import { Button } from 'react-bootstrap';

const AddButton = ({ openAddModal }) => {
    return (
        <Button
            onClick={openAddModal}
            className="btn btn-primary add-application-btn"
        >
            Add Job Application
        </Button>
    );
};

export default AddButton;
