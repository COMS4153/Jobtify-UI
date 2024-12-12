// src/components/CustomModal.jsx
import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomModal = ({
  show,
  handleClose,
  title,
  body,
  footer,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      {title && (
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      {body && <Modal.Body>{body}</Modal.Body>}
      {footer && (
        <Modal.Footer>
          {footer}
          {onSubmit && (
            <Button variant="primary" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Processing
                </>
              ) : (
                'Submit'
              )}
            </Button>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

CustomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  body: PropTypes.node,
  footer: PropTypes.node,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
};

CustomModal.defaultProps = {
  title: '',
  body: null,
  footer: null,
  onSubmit: null,
  isSubmitting: false,
};

export default CustomModal;
