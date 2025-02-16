import React, { useState, useRef, useEffect } from 'react';
import { updateNote } from '../services/noteService';

const NoteModal = ({ note, onClose, onUpdate }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isFavorite, setIsFavorite] = useState(note.isFavorite || false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const [editedNote, setEditedNote] = useState({
        title: note.title,
        content: note.content,
        images: note.images || []
    });

    useEffect(() => {
        if (audioRef.current && note.audioData) {
            audioRef.current.src = note.audioData;
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
            }
        };
    }, [note.audioData]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    const handleSave = async () => {
        try {
            await updateNote(note._id, {
                ...note,
                ...editedNote,
                isFavorite,
                lastModified: new Date().toISOString()
            });
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update note:', error);
            alert('Failed to update note');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setEditedNote(prev => ({
                        ...prev,
                        images: [...prev.images, reader.result]
                    }));
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Failed to upload image:', error);
                alert('Failed to upload image');
            }
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
            <div className={`bg-white rounded-lg ${isFullscreen ? 'w-full h-full' : 'w-[90%] max-w-2xl max-h-[90vh]'} overflow-auto`}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0 0l5-5m5 5v-4m0 4h-4m0 0l5-5" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <svg className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-500'}`} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="mb-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedNote.title}
                                onChange={(e) => setEditedNote(prev => ({ ...prev, title: e.target.value }))}
                                className="text-xl font-semibold mb-1 w-full border rounded px-2 py-1"
                            />
                        ) : (
                            <h2 className="text-xl font-semibold mb-1">{note.title}</h2>
                        )}
                        <div className="text-sm text-gray-500">{new Date(note.date).toLocaleString()}</div>
                    </div>

                    {note.type === 'recording' && note.audioData && (
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-2">
                                <button 
                                    onClick={togglePlayPause}
                                    className="p-3 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
                                >
                                    {isPlaying ? (
                                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{note.duration}</span>
                                    </div>
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-purple-600 transition-all duration-100"
                                            style={{ width: `${(currentTime / audioRef.current?.duration || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <audio 
                                ref={audioRef}
                                className="hidden"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Transcript</h3>
                        {isEditing ? (
                            <textarea
                                value={editedNote.content}
                                onChange={(e) => setEditedNote(prev => ({ ...prev, content: e.target.value }))}
                                className="w-full h-40 border rounded p-2 text-gray-600"
                            />
                        ) : (
                            <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleSave}
                                    className="p-2 hover:bg-green-100 rounded-full text-green-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-red-100 rounded-full text-red-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={handleCopy}
                                className="p-2 hover:bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteModal; 