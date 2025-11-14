require('dotenv').config();
const mongoose = require('mongoose');
const seedRooms = require('./src/seeders/roomSeeder');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-room-management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Run seeders
    await seedRooms();
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });