const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const initializeDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            family: 4
        });
        console.log('Connected to MongoDB');

        // Drop existing collections
        await mongoose.connection.dropDatabase();
        console.log('Dropped existing database');

        // Create test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const testUser = new User({
            email: 'test@example.com',
            password: hashedPassword,
            name: 'Test User',
            userId: Math.random().toString(36).substr(2, 9)
        });

        await testUser.save();
        console.log('Test user created successfully:', {
            email: testUser.email,
            userId: testUser.userId
        });

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
};

initializeDB(); 