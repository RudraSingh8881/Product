import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ message: 'Missing' })
  const existing = await User.findOne({ username })
  if (existing) return res.status(400).json({ message: 'User exists' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username, passwordHash })
  await user.save()
  res.json({ message: 'Registered' })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) return res.status(401).json({ message: 'Invalid' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid' })
  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, username: user.username })
})

export default router