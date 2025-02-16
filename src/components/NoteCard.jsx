import React, { useState } from 'react';
import { deleteNote, updateNote } from '../services/noteService';
import NoteModal from './NoteModal';

const NoteCard = ({ note, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(note.content);
            alert('Content copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy content');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await deleteNote(note._id);
                onUpdate();
            } catch (error) {
                console.error('Failed to delete note:', error);
                alert('Failed to delete note');
            }
        }
    };

    const handleRename = async () => {
        try {
            if (title !== note.title) {
                await updateNote(note._id, { ...note, title });
                onUpdate();
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to rename note:', error);
            alert('Failed to rename note');
        }
    };

    return (
        <>
            <div 
                className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
                
            >
                {/* Header with Date and Time */}
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">{formatTime(note.time)}</div>
                    <div className="text-sm text-gray-500">{formatDate(note.date)}</div>
                    <div className="flex items-center">
                        <span className="mr-2">{note.duration}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">{note.type}</span>
                    </div>
                </div>

                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                        className="text-lg font-medium mb-2 w-full border rounded px-2 py-1"
                        autoFocus
                    />
                ) : (
                    <h3 className="text-lg font-medium mb-2">{note.title}</h3>
                )}

                {/* Content */}
                <p onClick={() => setIsModalOpen(true)} className="text-gray-600 text-sm mb-4">{note.content}</p>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 hover:bg-gray-100 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="p-1.5 hover:bg-gray-100 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                                <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1.5 hover:bg-gray-100 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {note.images?.length > 0 && (
                            <button className="p-1.5 hover:bg-gray-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <NoteModal
                    note={note}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default NoteCard; 