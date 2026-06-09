const express = require('express');
const crypto = require('crypto');
const prisma = require('../prisma/client');
const authMiddleware = require('../auth/auth.middleware');
const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { video_hash } = req.body;
    const room_code = crypto.randomBytes(3).toString('hex').toUpperCase(); // Example: ABC123

    const room = await prisma.room.create({
      data: {
        room_code,
        host_id: req.user.id,
        video_hash
      }
    });

    res.json({ room_code });
  } catch (err) {
    res.status(500).json({ error: 'Error creating room' });
  }
});

router.get('/:code', authMiddleware, async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { room_code: req.params.code }
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    res.json({ room });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching room' });
  }
});

module.exports = router;
