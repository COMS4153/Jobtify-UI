import React from 'react';
import PropTypes from 'prop-types';
import '../css/Pagination.css'

const PaginationComponent = ({ currentPage, totalPages, paginate }) => {
    const pageNumbers = [];

    for (let number = 1; number <= totalPages; number++) {
        pageNumbers.push(
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        paginate(number);
                    }}
                >
                    {number}
                </a>
            </li>
        );
    }

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination pagination-lg justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <a
                        className="page-link"
                        href="#"
                        aria-label="Previous"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) paginate(currentPage - 1);
                        }}
                    >
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>

                {pageNumbers}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <a
                        className="page-link"
                        href="#"
                        aria-label="Next"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) paginate(currentPage + 1);
                        }}
                    >
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    );
};

PaginationComponent.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    paginate: PropTypes.func.isRequired,
};

export default PaginationComponent;
