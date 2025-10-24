import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization || ''      // 1
  const token = authHeader.replace('Bearer ', '')         // 2
  if (!token) return res.status(401).json({ message: 'No token' }) // 3

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET) // 4
    req.userId = data.id                                   // 5
    next()                                                // 6
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' }) // 7
  }
}
