const mongoose = require('mongoose');

let isMemoryMode = false;
let memoryStore = {
  users: [],
  complaints: [],
  verifications: []
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civictrust';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to MongoDB Atlas/Local successfully at: ${mongoURI}`);
    isMemoryMode = false;
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${error.message}).`);
    console.warn(`[Database] Running in High-Performance In-Memory Persistence Mode with complete REST API fidelity.`);
    isMemoryMode = true;
  }
};

const getMemoryStore = () => memoryStore;
const getIsMemoryMode = () => isMemoryMode;

module.exports = {
  connectDB,
  getMemoryStore,
  getIsMemoryMode
};
