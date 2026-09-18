const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, getIsMemoryMode, getMemoryStore } = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const { createSyntheticData } = require('./services/seedData');

// Route Handlers
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Seed Database on startup if needed
const seedDatabase = async () => {
  try {
    const seed = await createSyntheticData();
    
    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      store.users = [...seed.users];
      store.complaints = [...seed.complaints];
      console.log(`[Seed] In-Memory store seeded with ${store.users.length} users and ${store.complaints.length} synthetic complaints.`);
    } else {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.insertMany(seed.users);
        await Complaint.insertMany(seed.complaints);
        console.log(`[Seed] MongoDB seeded with synthetic prototype civic complaints.`);
      } else {
        console.log(`[Seed] MongoDB already contains ${userCount} users. Ready.`);
      }
    }
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
};

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CivicTrust API - Resolved Should Mean Resolved',
    version: '1.0.0-hackathon-prototype',
    mode: getIsMemoryMode() ? 'In-Memory Fidelity Store' : 'MongoDB Connected',
    time: new Date().toISOString(),
  });
});

// Demo Data Reset Endpoint (Ideal for Hackathon resetting)
app.post('/api/seed/reset', async (req, res) => {
  try {
    const seed = await createSyntheticData();
    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      store.users = [...seed.users];
      store.complaints = [...seed.complaints];
      store.verifications = [];
    } else {
      await User.deleteMany({});
      await Complaint.deleteMany({});
      await User.insertMany(seed.users);
      await Complaint.insertMany(seed.complaints);
    }
    res.json({ message: 'Synthetic prototype data reset successfully to initial state.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting seed data', error: error.message });
  }
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  CIVICTRUST SERVER RUNNING ON PORT ${PORT}`);
    console.log(`  "Resolved should mean resolved."`);
    console.log(`  API Base: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
};

startServer();
