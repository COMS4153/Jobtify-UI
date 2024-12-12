// src/components/AuthForm.jsx
import React from 'react';
// import './AuthForm.css'; 

const AuthForm = ({
    title,
    children,
    onSubmit,
    error,
    submitButtonText,
    footer
}) => {
    return (
        <div className="card">
            <h2 className="card-title">{title}</h2>
            {error && <div className="alert-danger">{error}</div>}
            <form onSubmit={onSubmit}>
                {children}
                <button type="submit" className="btn-primary">
                    {submitButtonText}
                </button>
            </form>
            {footer && <div className="footer-links">{footer}</div>}
        </div>
    );
};

export default AuthForm;
