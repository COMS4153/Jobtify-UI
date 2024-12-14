import React from 'react';
import '../css/CustomCard.css';

const AgCoursesBox = ({ children }) => {
    return (
        <div className="ag-format-container">
            <div className="ag-courses_box">
                {children}
            </div>
        </div>
    );
};

export default AgCoursesBox;
