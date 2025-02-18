import React, { useState, useEffect, useRef } from 'react';
import { createNote } from '../services/noteService';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [noteData, setNoteData] = useState({
        title: '',
        content: '',
        type: 'text',
    });
    const [user, setUser] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const [transcribedText, setTranscribedText] = useState('');
    const audioChunksRef = useRef([]);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.id) {
                throw new Error('No valid user data found');
            }
            setUser(userData);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }, []);

    // Initialize speech recognition
    const initSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    }
                }
                setTranscribedText(prevText => prevText + finalTranscript);
            };
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            // Simplified audio configuration
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1
                } 
            });
            
            // Check supported MIME types
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
                
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000 // More compatible bitrate
            });
            
            audioChunksRef.current = [];

            // Collect audio chunks
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            // Initialize speech recognition
            initSpeechRecognition();
            
            setIsRecording(true);
            setRecordingDuration(0);
            setTranscribedText('');
            
            // Start duration timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
            
            // Start recording
            mediaRecorderRef.current.start(1000); // Record in 1-second chunks
            recognitionRef.current?.start();

            // Stop after 1 minute
            setTimeout(() => {
                if (isRecording) {
                    stopRecording();
                }
            }, 60000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Failed to start recording. Please make sure your microphone is connected and you have granted permission to use it.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Clear duration timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            mediaRecorderRef.current.stop();
            recognitionRef.current?.stop();
            
            mediaRecorderRef.current.onstop = async () => {
                try {
                    // Check for user data before proceeding
                    if (!user || !user.id) {
                        throw new Error('No valid user data');
                    }

                    const audioBlob = new Blob(audioChunksRef.current, { 
                        type: 'audio/webm;codecs=opus' 
                    });
                    
                    const compressedBlob = await compressAudio(audioBlob);
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedBlob);
                    
                    reader.onloadend = async () => {
                        try {
                            const base64Audio = reader.result;
                            const currentTime = new Date();
                            
                            const newNote = {
                                title: `Voice Note - ${currentTime.toLocaleTimeString()}`,
                                content: transcribedText || 'No transcription available',
                                type: 'recording',
                                time: currentTime.toLocaleTimeString(),
                                date: currentTime.toISOString(),
                                duration: formatDuration(recordingDuration),
                                audioData: base64Audio,
                                userId: user.id,
                                images: [],
                                lastModified: currentTime.toISOString()
                            };

                            await createNote(newNote);
                            setTranscribedText('');
                            setRecordingDuration(0);
                            window.location.reload();
                        } catch (error) {
                            console.error('Failed to create note:', error);
                            alert('Failed to create note. Please try again.');
                        }
                    };
                } catch (error) {
                    console.error('Error in stopRecording:', error);
                    alert('Error creating note. Please make sure you are logged in.');
                    window.location.href = '/login';
                }
            };
            
            setIsRecording(false);
        }
    };

    // Update the compressAudio function to be more compatible
    const compressAudio = async (blob) => {
        try {
            if (blob.size <= 5 * 1024 * 1024) { // 5MB limit
                return blob;
            }

            // Simple compression by converting to lower quality
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const offlineContext = new OfflineAudioContext({
                numberOfChannels: 1,
                length: audioBuffer.duration * 22050,
                sampleRate: 22050
            });
            
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start();
            
            const renderedBuffer = await offlineContext.startRendering();
            
            // Convert back to blob with lower quality
            const newBlob = await new Promise(resolve => {
                const channels = renderedBuffer.numberOfChannels;
                const samples = renderedBuffer.length;
                const data = new Float32Array(samples);
                renderedBuffer.copyFromChannel(data, 0);
                
                const newBlob = new Blob([data], { 
                    type: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                        ? 'audio/webm;codecs=opus' 
                        : 'audio/webm' 
                });
                resolve(newBlob);
            });
            
            return newBlob;
        } catch (error) {
            console.error('Compression failed, returning original blob:', error);
            return blob; // Return original if compression fails
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!user || !user.id) {
                throw new Error('No valid user data');
            }

            const newNote = {
                title: noteData.title,
                content: noteData.content,
                type: noteData.type,
                time: new Date().toLocaleTimeString(),
                date: new Date().toISOString(),
                images: [],
                userId: user.id,
                duration: '',
                lastModified: new Date().toISOString()
            };
            
            await createNote(newNote);
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Failed to create note:', error);
            alert('Failed to create note. Please make sure you are logged in.');
            window.location.href = '/login';
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <>
            <div className="border-t">
                <div className="flex items-center my-2 justify-between shadow-xl rounded-3xl max-w-3xl border-2 mx-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            className="p-2 ms-2 hover:bg-gray-100 rounded-full"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                    <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-6 py-2 ${isRecording ? 'bg-gray-500' : 'bg-red-500'} text-white rounded-full hover:${isRecording ? 'bg-gray-600' : 'bg-red-600'}`}
                    >
                        {isRecording ? `Stop (${formatDuration(recordingDuration)})` : 'Start Recording'}
                    </button>
                </div>
                {isRecording && (
                    <div className="text-center mt-2 text-sm text-gray-600">
                        Recording in progress... {formatDuration(recordingDuration)}
                        <br />
                        Transcribed text will appear in the note.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Create New Note</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={noteData.title}
                                    onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Content
                                </label>
                                <textarea
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                                    value={noteData.content}
                                    onChange={(e) => setNoteData({...noteData, content: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Create Note
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Footer;
