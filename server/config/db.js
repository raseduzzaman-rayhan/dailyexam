import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is missing.');
    console.error('Please configure MONGODB_URI in your .env file.');
    throw new Error('MONGODB_URI is required to start the server.');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB Atlas:', error.message);
    throw error;
  }
};

export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
