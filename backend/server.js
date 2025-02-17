const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Increase header and payload limits - add these before other middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    exposedHeaders: ['Content-Length', 'Authorization'],
    maxAge: 600,
    credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4  // Use IPv4, skip trying IPv6
})
.then(() => {
    console.log('Connected to MongoDB successfully');
    // Create indexes for better performance
    User.createIndexes();
    Note.createIndexes();
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Add connection event handlers
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

// Note Schema
const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  content: String,
  type: String,
  time: String,
  duration: String,
  audioData: String,  // Store base64 audio data
  images: [String],
  isFavorite: { type: Boolean, default: false },
  date: String,
  lastModified: String
}, {
  // Add timestamps for better tracking
  timestamps: true
});

// Add compound index for userId and search
noteSchema.index({ userId: 1, title: 'text', content: 'text' });

const Note = mongoose.model('Note', noteSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ userId: decoded.userId });
    if (!user) throw new Error('User not found');

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with generated userId
    const user = new User({
      email,
      password: hashedPassword,
      name,
      userId: Math.random().toString(36).substr(2, 9) // Generate a random ID
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.userId,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user.userId,
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt');
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Debug log

    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No'); // Debug log

    if (!user) {
      console.log('No user found with email:', email); // Debug log
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No'); // Debug log

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.userId,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email); // Debug log

    res.json({ 
      token, 
      user: { 
        id: user.userId,
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Routes
app.get('/api/notes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-date', search } = req.query;
    
    // Build base query using where
    let baseQuery = Note.where('userId').equals(req.user.userId);
    console.log('User ID:', req.user.userId);

    // Add search conditions if search parameter exists
    if (search) {
      baseQuery = baseQuery.or([
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ]);
    }

    // Execute query with pagination
    const notes = await baseQuery
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get total documents count
    const total = await Note.where('userId').equals(req.user.userId).countDocuments();

    console.log('Found notes:', notes.length);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Notes error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notes', auth, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user.userId,
      date: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete note
app.delete('/api/notes/:id', auth, async (req, res) => {
  try {
    const result = await Note.deleteOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update note
app.put('/api/notes/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    Object.assign(note, req.body);
    note.lastModified = new Date().toISOString();
    
    const updatedNote = await note.save();
    res.json(updatedNote); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, '0.0.0.0', (error) => {
    if (error) { 
        console.error('Error starting server:', error);
        return;
    }
    console.log(`Server is running on http://localhost:${PORT}`);
});
