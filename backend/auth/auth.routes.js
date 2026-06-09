const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authMiddleware = require('./auth.middleware');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  try {
    const { email, password, display_name, avatar_id } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password_hash, display_name, avatar_id }
    });

    const token = jwt.sign({ id: user.id, email: user.email, display_name: user.display_name, avatar_id: user.avatar_id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, display_name: user.display_name, avatar_id: user.avatar_id } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, display_name: user.display_name, avatar_id: user.avatar_id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, display_name: user.display_name, avatar_id: user.avatar_id } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { display_name, avatar_id } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { display_name, avatar_id }
    });
    
    const token = jwt.sign({ id: user.id, email: user.email, display_name: user.display_name, avatar_id: user.avatar_id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, display_name: user.display_name, avatar_id: user.avatar_id } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
