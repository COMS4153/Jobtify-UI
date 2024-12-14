import React from 'react';

const StatusFilter = ({ filterStatus, setFilterStatus, statuses }) => {
    return (
        <div className="btn-group dropend">
            <button
                type="button"
                className="btn btn-outline-warning dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                Filter by Status: {filterStatus.toUpperCase()}
            </button>
            <ul className="dropdown-menu">
                {statuses.map((status) => (
                    <li key={status}>
                        <button
                            className="dropdown-item"
                            onClick={() => setFilterStatus(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StatusFilter;
