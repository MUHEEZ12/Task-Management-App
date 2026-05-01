import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@taskflow.com' });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@taskflow.com',
      password: 'password123',
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: test@taskflow.com');
    console.log('Password: password123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
