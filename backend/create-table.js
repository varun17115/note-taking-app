
const mongoose = require('mongoose');

// MongoDB connection URI
const uri = "mongodb://localhost:27017/note_app";

// Define Note Schema
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  type: String,
  time: String,
  duration: String,
  images: [String],
  date: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});

// Create Note model
const Note = mongoose.model('Note', noteSchema);

// Connect to MongoDB
mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Initial data
    const initialNotes = [
      {
        title: 'Meeting Notes',
        content: 'Discussed Q1 objectives and team goals',
        type: 'text',
        time: '5:26 AM',
        duration: '',
        images: [],
        date: new Date('2024-03-01T08:00:00Z'),
        lastModified: new Date('2024-03-01T08:00:00Z')
      },
      {
        title: 'Shopping List',
        content: 'Milk, eggs, bread, vegetables',
        type: 'text',
        time: '5:26 AM',
        duration: '',
        images: [],
        date: new Date('2024-03-02T09:00:00Z'),
        lastModified: new Date('2024-03-02T09:30:00Z')
      }
    ];

    try {
      await Note.insertMany(initialNotes);
      console.log('Initial notes inserted successfully');
    } catch (error) {
      console.error('Error inserting notes:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

module.exports = Note;
