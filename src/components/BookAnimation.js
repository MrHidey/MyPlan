import React from 'react';
import './BookAnimation.css';

const BookAnimation = () => {
  return (
    <div className="book-animation-container">
      <div className="bookshelf">
        <div className="book book-1"></div>
        <div className="book book-2"></div>
        <div className="book book-3"></div>
        <div className="book book-4"></div>
      </div>
      
      <div className="search-empty-message">
        <h3>No notes found at this time</h3>
      </div>
    </div>
  );
};

export default BookAnimation;
