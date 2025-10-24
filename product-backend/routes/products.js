import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Create
router.post('/', async (req, res) => {
  try {
    const p = new Product(req.body);
    const saved = await p.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Read all
router.get('/', async (req, res) => {
  try {
    const items = await Product.find();
    res.json(items);
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get('/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Patch
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
