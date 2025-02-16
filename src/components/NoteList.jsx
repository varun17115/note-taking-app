import React, { useEffect, useState } from 'react';
import NoteCard from './NoteCard';
import { getNotes } from '../services/noteService';

const NoteList = () => {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data.notes);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <>
      {notes && notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onUpdate={fetchNotes}
        />
      ))}
    </>
  );
};

export default NoteList;
