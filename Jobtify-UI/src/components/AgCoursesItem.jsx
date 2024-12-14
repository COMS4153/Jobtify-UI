// src/components/AgCoursesItem.jsx
import React from 'react';
import { FaBuilding, FaDollarSign, FaLink, FaCalendarAlt, FaStickyNote, FaMapMarkerAlt, FaIndustry, FaBriefcase } from 'react-icons/fa';
import { Spinner, Button } from 'react-bootstrap';
import '../css/CustomCard.css';

const AgCoursesItem = ({
  type,
  data,
  companyName,
  title,
  salary,
  status,
  date,
  notes,
  onView,
  onDelete,
  loadingDelete,
  children
}) => {
  return (
    <div className="ag-courses_item" style={{ cursor: "pointer" }} onClick={onView}>
      <div className="ag-courses-item_link" style={{ position: 'relative', zIndex: 2 }}>
        <div className="ag-courses-item_bg"></div>
        <div className="ag-courses-item_title" style={{ position: 'relative', zIndex: 3 }}>
          {type === 'application' ? (companyName || 'Unavailable') : (title.length > 40 ? `${title.substring(0, 40)}...` : title)}
        </div>

        {type === 'application' ? (
          <>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <strong><FaBuilding className="icon" style={{ marginRight: '5px' }} /></strong>
              <span className="ag-courses-text">{title || 'Unknown'}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <strong><FaDollarSign className="icon" style={{ marginRight: '5px' }} /></strong>
              <span className="ag-courses-text">{salary ? `$${salary.toLocaleString()}` : 'Unknown'}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <strong><FaLink className='icon' style={{ marginRight: '5px' }} /></strong>
              <span className="ag-courses-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <strong><FaCalendarAlt className="icon" style={{ marginRight: '5px' }} /></strong>
              <span className="ag-courses-text">{new Date(date).toLocaleDateString()}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <strong><FaStickyNote className="icon" style={{ marginRight: '5px' }} /></strong>
              <span className="ag-courses-text">{notes || 'None'}</span>
            </div>
          </>
        ) : (
          <>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <FaBuilding className="icon" style={{ marginRight: '5px' }} />
              <span className="ag-courses-text">{data.company}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <FaMapMarkerAlt style={{ marginRight: '5px' }} />
              <span className="ag-courses-text">{data.location}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <FaDollarSign style={{ marginRight: '5px' }} />
              <span className="ag-courses-text">${data.salary.toLocaleString()}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              <FaIndustry style={{ marginRight: '5px' }} />
              <span className="ag-courses-text">{data.industry}</span>
            </div>
            <div className="ag-courses-item_date-box" style={{ position: 'relative', zIndex: 3 }}>
              Description: <span className="ag-courses-text">
                {data.description.length > 90 ? `${data.description.substring(0, 90)}...` : data.description}
              </span>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', position: 'relative', zIndex: 3 }}>
          {type === 'application' && (
            <Button
              variant="danger"
              style={{
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                padding: '6px 10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    style={{ marginRight: '5px' }}
                  /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AgCoursesItem;
