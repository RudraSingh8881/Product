import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

// CORS - allow frontend origins via env or sensible defaults
const allowedOrigins = [process.env.FRONTEND_URL || 'https://product-frontend-mekh.onrender.com', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, methods: ['GET','POST','PUT','PATCH','DELETE'], credentials: true }));
app.options('*', cors());

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl, 'body:', JSON.stringify(req.body));
  next();
});

// --- Models (inlined) ---
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String }
}, { timestamps: true });

const Product = models?.Product || model('Product', productSchema);

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const User = models?.User || model('User', userSchema);

// --- Auth middleware (inlined) ---
import jwt from 'jsonwebtoken';
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// --- Routes (inlined) ---
const api = express.Router();

// Products routes
const productsRouter = express.Router();

productsRouter.post('/', async (req, res) => {
  try {
    const p = new Product(req.body);
    const saved = await p.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ error: err.message });
  }
});

productsRouter.get('/', async (req, res) => {
  try {
    const items = await Product.find();
    res.json(items);
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ error: err.message });
  }
});

productsRouter.get('/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

productsRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

productsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Users routes
const usersRouter = express.Router();

usersRouter.post('/', async (req, res) => {
  try {
    console.log('Registering user:', { ...req.body, password: '[FILTERED]' });
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already exists' });
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, passwordHash });
    const saved = await user.save();
    const { passwordHash: _, ...safeUser } = saved.toObject();
    return res.status(201).json(safeUser);
  } catch (err) {
    console.error('POST /api/users error:', err);
    return res.status(500).json({ error: err.message });
  }
});

usersRouter.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: err.message });
  }
});

usersRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const { passwordHash, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Mount routers
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

// Start server and connect to DB
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Masked log of the URI (password replaced) to help debug env issues
  const rawUri = process.env.MONGODB_URI || '';
  const maskedUri = rawUri ? rawUri.replace(/:(.*)@/, ':***@') : '[not set]';
  console.log('MONGODB_URI (masked):', maskedUri);

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
});
