import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
    });

    return conn.connection;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
