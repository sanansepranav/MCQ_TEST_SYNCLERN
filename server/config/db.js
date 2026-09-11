const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

/**
 * Connect to MongoDB with automatic embedded fallback for local development.
 * Reads MONGO_URI from environment variables.
 */
const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/digital_microsys';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2500,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    setupEventListeners();
    return conn;
  } catch (initialErr) {
    // If local connection failed, spin up embedded MongoDB
    if (!mongodInstance && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
      try {
        console.log('📦  No external MongoDB detected on localhost. Launching embedded MongoDB engine...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const dbPath = path.join(__dirname, '../.mongodb_data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }

        mongodInstance = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbPath: dbPath,
            storageEngine: 'wiredTiger',
          },
        });

        const instanceUri = mongodInstance.getUri('digital_microsys');
        console.log(`✅  Embedded MongoDB running on: ${instanceUri}`);
        process.env.MONGO_URI = instanceUri;

        const conn = await mongoose.connect(instanceUri, {
          autoIndex: true,
        });

        console.log(`✅  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        setupEventListeners();

        // Clean shutdown handlers
        const cleanup = async () => {
          if (mongodInstance) {
            console.log('🛑  Shutting down embedded MongoDB...');
            await mongoose.disconnect();
            await mongodInstance.stop();
            process.exit(0);
          }
        };
        process.once('SIGINT', cleanup);
        process.once('SIGTERM', cleanup);

        return conn;
      } catch (embeddedErr) {
        console.error(`❌  Failed to launch embedded MongoDB: ${embeddedErr.message}`);
      }
    }

    console.error(`❌  MongoDB connection failed: ${initialErr.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.log('🔄  Retrying connection in 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectDB();
  }
};

const setupEventListeners = () => {
  mongoose.connection.on('error', (err) => {
    console.error(`❌  MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄  MongoDB reconnected.');
  });
};

module.exports = connectDB;

