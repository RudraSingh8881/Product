import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('No MONGODB_URI found in .env');
  process.exit(1);
}

console.log('Attempting mongoose.connect to masked URI:', uri.replace(/:(.*)@/, ':***@'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Test: Connected to MongoDB');
    return mongoose.connection.close();
  })
  .catch(err => {
    console.error('Test: MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });
