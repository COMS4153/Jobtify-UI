import React from 'react';

const TimeFilter = ({ timeFilter, setTimeFilter, timeFilters }) => {
    return (
        <div className="btn-group dropend">
            <button
                type="button"
                className="btn btn-outline-info dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                Filter by Time: {timeFilter.replace("_", " ")}
            </button>
            <ul className="dropdown-menu">
                {timeFilters.map((time) => (
                    <li key={time}>
                        <button
                            className="dropdown-item"
                            onClick={() => setTimeFilter(time)}
                        >
                            {time === "ALL"
                                ? "All time"
                                : time === "LAST_WEEK"
                                    ? "Last week"
                                    : time === "LAST_MONTH"
                                        ? "Last month"
                                        : "Last year"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TimeFilter;
