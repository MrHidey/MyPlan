// src/components/SearchBar.jsx
import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by subject, title, or keyword..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchFilter;
