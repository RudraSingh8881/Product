import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';

dotenv.config();
const app = express();

// Allow all origins for debugging (change to specific origin when fixed)
app.use(cors({
  origin: ["https://product-frontend-mekh.onrender.com"], // ✅ your frontend Render link
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Handle preflight for all routes
app.options('*', cors());

// Middleware
app.use(express.json());

// simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl, 'body:', JSON.stringify(req.body));
  next();
});

// routes
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
});
