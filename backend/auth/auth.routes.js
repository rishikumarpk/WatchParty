const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const supabase = require('../supabase/client');
const authMiddleware = require('./auth.middleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// --- Supabase Session Sync ---
// Synchronizes an authenticated Supabase user into the Postgres/Prisma User table
// and returns an application JWT + user profile for room/socket compatibility
router.post('/supabase-sync', async (req, res) => {
  try {
    const { access_token, display_name, avatar_id } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Missing Supabase access token' });
    }

    let supabaseUser = null;

    if (supabase) {
      const { data, error } = await supabase.auth.getUser(access_token);
      if (error || !data?.user) {
        return res.status(401).json({ error: 'Invalid or expired Supabase session' });
      }
      supabaseUser = data.user;
    } else {
      // If backend SUPABASE_URL / SUPABASE_ANON_KEY are not configured, decode claims or return friendly error
      return res.status(500).json({
        error: 'Backend Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env'
      });
    }

    const email = supabaseUser.email;
    const finalDisplayName = display_name || supabaseUser.user_metadata?.display_name || (email ? email.split('@')[0] : 'User');
    const finalAvatarId = avatar_id || supabaseUser.user_metadata?.avatar_id || 'avatar_1';

    // Check if user already exists by ID or Email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: supabaseUser.id },
          { email: email }
        ]
      }
    });

    if (!user) {
      // Create new user linked to Supabase user ID
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: email,
          password_hash: 'supabase_managed_auth',
          display_name: finalDisplayName,
          avatar_id: finalAvatarId
        }
      });
    } else {
      // Update metadata if provided and changed
      const updateData = {};
      if (display_name && display_name !== user.display_name) {
        updateData.display_name = display_name;
      }
      if (avatar_id && avatar_id !== user.avatar_id) {
        updateData.avatar_id = avatar_id;
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_id: user.avatar_id
      },
      JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_id: user.avatar_id
      }
    });
  } catch (err) {
    console.error('Supabase sync error:', err);
    res.status(500).json({ error: 'Failed to synchronize Supabase session with database' });
  }
});

// --- Update Profile ---
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { display_name, avatar_id } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { display_name, avatar_id }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, display_name: user.display_name, avatar_id: user.avatar_id },
      JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user.id,
        display_name: user.display_name,
        avatar_id: user.avatar_id
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Get Current User Profile ---
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_id: true,
        created_at: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
