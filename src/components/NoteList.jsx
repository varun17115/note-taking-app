import React, { useEffect, useState } from 'react';
import NoteCard from './NoteCard';
import { getNotes } from '../services/noteService';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (order) => {
    setSortOrder(order);
    // Fetch notes with new sort order
    fetchNotes({
      sort: order === 'asc' ? 'date' : '-date'  // '-date' for descending, 'date' for ascending
    });
  };
  const fetchNotes = async (params = {}) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        sort: params.sort || (sortOrder === 'desc' ? '-date' : 'date'),
        // ... other existing params ...
      });

      const response = await fetch(`/api/notes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
