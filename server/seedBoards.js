import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Board from './src/models/Board.js';
import Column from './src/models/Column.js';
import User from './src/models/User.js';

dotenv.config();

const seedBoardsAndColumns = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Get the test user
    const user = await User.findOne({ email: 'test@taskflow.com' });
    if (!user) {
      console.log('Test user not found. Please run seed.js first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Using user: ${user.name} (${user.email})`);

    // Check if boards already exist
    const existingBoards = await Board.find({ owner: user._id });
    if (existingBoards.length > 0) {
      console.log(`${existingBoards.length} boards already exist. Skipping...`);
      await mongoose.disconnect();
      return;
    }

    // Create boards with columns
    const boardsData = [
      {
        title: 'Product Development',
        description: 'Building the next generation features',
        color: '#3B82F6',
        columns: ['Backlog', 'In Progress', 'Review', 'Done'],
      },
      {
        title: 'Marketing Campaign',
        description: 'Q2 marketing initiatives and campaigns',
        color: '#8B5CF6',
        columns: ['Planning', 'In Progress', 'Testing', 'Published'],
      },
      {
        title: 'Customer Support',
        description: 'Support tickets and issue tracking',
        color: '#EC4899',
        columns: ['New', 'Assigned', 'In Progress', 'Resolved'],
      },
      {
        title: 'Personal Projects',
        description: 'Side projects and learning goals',
        color: '#10B981',
        columns: ['Ideas', 'Started', 'In Progress', 'Complete'],
      },
    ];

    for (const boardData of boardsData) {
      // Create board first
      const board = await Board.create({
        title: boardData.title,
        description: boardData.description,
        color: boardData.color,
        owner: user._id,
        members: [user._id],
        columns: [], // Will update after creating columns
      });

      // Create columns with board reference
      const columnIds = [];
      for (const columnName of boardData.columns) {
        const column = await Column.create({
          title: columnName,
          board: board._id,
          order: boardData.columns.indexOf(columnName),
          tasks: [],
        });
        columnIds.push(column._id);
      }

      // Update board with column IDs
      board.columns = columnIds;
      await board.save();

      console.log(`✅ Created board: ${board.title}`);
    }

    console.log('\n✅ All boards created successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding boards:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedBoardsAndColumns();
