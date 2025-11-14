const Room = require('../models/room.model');
const mongoose = require('mongoose');

// Sample room data
const sampleRooms = [
  {
    name: 'Phòng họp A',
    type: 'Nhỏ',
    capacity: 8,
    description: 'Phòng họp nhỏ phù hợp cho team meeting',
    status: 'available',
    equipment: ['projector', 'whiteboard', 'wifi', 'air_conditioner']
  },
  {
    name: 'Phòng họp B',
    type: 'Trung bình',
    capacity: 15,
    description: 'Phòng họp trung bình cho training và workshop',
    status: 'available',
    equipment: ['projector', 'whiteboard', 'tv', 'wifi', 'air_conditioner']
  },
  {
    name: 'Phòng họp C',
    type: 'Lớn',
    capacity: 30,
    description: 'Phòng họp lớn cho hội nghị và sự kiện',
    status: 'available',
    equipment: ['projector', 'whiteboard', 'tv', 'video_conference', 'wifi', 'air_conditioner']
  }
];

// Function to seed data
const seedRooms = async () => {
  try {
    // Clear existing rooms
    await Room.deleteMany({});
    
    // Insert sample rooms
    await Room.insertMany(sampleRooms);
    
    console.log('Sample rooms data seeded successfully');
  } catch (error) {
    console.error('Error seeding rooms data:', error);
  }
};

// Export the seeder function
module.exports = seedRooms;
