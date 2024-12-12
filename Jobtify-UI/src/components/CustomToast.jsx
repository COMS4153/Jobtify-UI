// src/components/CustomToast.jsx
import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const CustomToast = ({ show, message, onClose, delay = 3000 }) => {
  return (
    <ToastContainer className="p-3" style={{ position: 'fixed', bottom: '2rem', right: '1rem', zIndex: 1055 }}>
      <Toast show={show} onClose={onClose} delay={delay} autohide bg={'light'}>
        <Toast.Header
        style={{
          background: 'linear-gradient(to right, #6a11cb, #2575fc)',
          color: '#fff',
        }}>
          <FaCheckCircle className="me-2" style={{ color: 'white' }} />
          <strong className="me-auto">Notification</strong>
          <small>Now</small>
        </Toast.Header>
        <Toast.Body className={'text-dark'}>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

CustomToast.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  delay: PropTypes.number,
};

export default CustomToast;
