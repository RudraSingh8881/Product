import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// Create user (register)
router.post('/', async (req, res) => {
  try {
    console.log('Registering user:', { ...req.body, password: '[FILTERED]' });
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const user = new User({ username, passwordHash });
    const saved = await user.save();
    
    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = saved.toObject();
    return res.status(201).json(safeUser);
  } catch (err) {
    console.error('POST /api/users error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get all users (without passwordHash)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Send user data (excluding password)
    const { passwordHash, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;

// In your frontend registration handler
const handleRegister = async (username, password) => {
  try {
    const response = await fetch('http://localhost:5005/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    alert('Registration successful!');
    // redirect to login or handle success
  } catch (err) {
    alert('Registration failed: ' + err.message);
  }
};