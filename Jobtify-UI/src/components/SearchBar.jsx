import React from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <InputGroup style={{ maxWidth: "400px" }}>
            <Form.Control
                className="custom-input"
                style={{
                    color: "#fff",
                    backgroundColor: "#000",
                    borderColor: "gray",
                    borderRadius: "8px 0 0 8px",
                }}
                placeholder="Find Company or Position"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                Clear
            </Button>
        </InputGroup>
    );
};

export default SearchBar;
