import React, { useEffect, useState } from 'react';
import { getAllNotes } from '../services/api';
import NoteCard from '../components/NoteCard';
import SearchFilter from '../components/SearchFilter';
import './Home.css';
import BookAnimation from '../components/BookAnimation';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);

  useEffect(() => {
    getAllNotes().then((notes) => {
      if (Array.isArray(notes)) {
        setNotes(notes);
        setFilteredNotes(notes);
      }
     else {
        setNotes([]);
        setFilteredNotes([]);
      }
    });
  }, []);
  
  
  

  const handleSearch = (query) => {
    const filtered = notes.filter(note =>
      note.subject.toLowerCase().includes(query.toLowerCase())|| note.title.toLowerCase().includes(query.toLowerCase()));
      setFilteredNotes(filtered);
  };

  return (
    <div className="homepage">
      <h1>All Study Notes</h1>
      <SearchFilter onSearch={handleSearch} />
      {filteredNotes.length === 0 ?(
          <BookAnimation/>
      ) : (
        <div className="note-list">
          {filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;