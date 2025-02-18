const mongoose = require('mongoose');
require('dotenv').config();

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
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
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
