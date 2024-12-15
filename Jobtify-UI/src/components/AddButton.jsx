import React from 'react';
import { Button } from 'react-bootstrap';
import {useNavigate} from "react-router-dom";

const AddButton = () => {
    const navigate = useNavigate();

    const handleAddClick = (e) => {
        navigate('/jobs')
    }

    return (
        <Button
            onClick={handleAddClick}
            className="btn btn-primary add-application-btn"
        >
            Add Job Application
        </Button>
    );
};

export default AddButton;
