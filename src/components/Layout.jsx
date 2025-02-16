import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NoteCard from './NoteCard';
import Footer from './Footer';
import { getNotes } from '../services/noteService';

const Layout = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch notes when search changes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await getNotes({ search: debouncedSearch });
        setNotes(response.notes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [debouncedSearch]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleNoteUpdate = async () => {
    try {
      const response = await getNotes({ search: debouncedSearch });
      setNotes(response.notes);
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  return (
    <div className="flex h-screen p-3 bg-white">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header onSearch={handleSearch} />
        
        {/* Notes Container */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map(note => (
                <NoteCard 
                  key={note._id} 
                  note={note} 
                  onUpdate={handleNoteUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              {searchQuery ? 'No notes found matching your search' : 'No notes yet. Start by creating one!'}
            </div>
          )}
        </div>

        {/* Footer Input */}
        <Footer onNoteCreated={handleNoteUpdate} />
      </div>
    </div>
  );
};

export default Layout; 