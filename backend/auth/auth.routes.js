const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authMiddleware = require('./auth.middleware');
const { Resend } = require('resend'); // Just to keep it unused or remove it completely
const { google } = require('googleapis');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

const sendEmailHTTP = async (to, subject, html) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: WatchTogether <${process.env.EMAIL}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    html
  ];
  const message = messageParts.join('\n');
  
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
  return res.data;
};

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const RegisterEmailHtml = (email, subject, name, passcode) => `
<div style="width:100%;max-width:700px;margin:0 auto;background-color:#ffffff;border:1px solid #000000;padding:40px 20px;font-family:sans-serif;box-sizing:border-box;">
  <div style="width:100%;max-width:500px;margin:0 auto;border:1px solid #000000;background-color:#ffffff;padding:40px 20px;text-align:center;box-sizing:border-box;">
    <div style="margin-bottom:30px;">
      <span style="font-size:24px;font-weight:bold;color:#000000;">▶ WatchTogether</span>
    </div>
    <h2 style="font-size:28px;color:#000000;margin-bottom:30px;font-weight:normal;">Welcome, ${name}</h2>
    <div style="font-size:48px;font-weight:bold;letter-spacing:8px;color:#000000;margin:30px 0;">
      ${passcode}
    </div>
  </div>
</div>
`;


const PWDEmailHtml = (email, subject, name, passcode) => `
<div style="width:100%;max-width:700px;margin:0 auto;background-color:#ffffff;border:1px solid #000000;padding:40px 20px;font-family:sans-serif;box-sizing:border-box;">
  <div style="width:100%;max-width:500px;margin:0 auto;border:1px solid #000000;background-color:#ffffff;padding:40px 20px;text-align:center;box-sizing:border-box;">
    <div style="margin-bottom:30px;">
      <span style="font-size:24px;font-weight:bold;color:#000000;">▶ WatchTogether</span>
    </div>
    <h2 style="font-size:28px;color:#000000;margin-bottom:30px;font-weight:normal;">Hello, ${name}</h2>
    <p style="font-size:16px;color:#000000;margin-bottom:20px;">Here is your passcode to reset your password:</p>
    <div style="font-size:48px;font-weight:bold;letter-spacing:8px;color:#000000;margin:30px 0;">
      ${passcode}
    </div>
  </div>
</div>
`;

// --- Registration Flow ---

router.post('/send-register-code', async (req, res) => {
  try {
    const { email, password, display_name, avatar_id } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const code = generateCode();
    const data = JSON.stringify({ password, display_name, avatar_id });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.verificationCode.upsert({
      where: { email },
      update: { code, data, expiresAt },
      create: { email, code, data, expiresAt }
    });

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.error('Missing GOOGLE_REFRESH_TOKEN in .env file.');
      return res.status(500).json({ error: 'Email service configuration error. Missing Google OAuth Credentials.' });
    }

    try {
      await sendEmailHTTP(
        email, 
        'Verify your WatchTogether Account', 
        RegisterEmailHtml(email, 'Verify your WatchTogether Account', display_name, code)
      );
    } catch (error) {
      console.error('Google API Error:', error);
      return res.status(500).json({ error: 'Failed to send email via Google API.' });
    }

    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

router.post('/verify-register', async (req, res) => {
  try {
    const { email, code } = req.body;

    const record = await prisma.verificationCode.findUnique({ where: { email } });
    if (!record || record.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    const { password, display_name, avatar_id } = JSON.parse(record.data);
    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password_hash, display_name, avatar_id }
    });

    await prisma.verificationCode.delete({ where: { email } });

    const token = jwt.sign({ id: user.id, email: user.email, display_name: user.display_name, avatar_id: user.avatar_id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, display_name: user.display_name, avatar_id: user.avatar_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Legacy direct register fallback just in case ---
router.post('/register', async (req, res) => {
  try {
    const { email, password, display_name, avatar_id } = req.body;
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

// --- Forgot Password Flow ---

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationCode.upsert({
      where: { email },
      update: { code, data: null, expiresAt },
      create: { email, code, data: null, expiresAt }
    });

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.error('Missing GOOGLE_REFRESH_TOKEN in .env file.');
      return res.status(500).json({ error: 'Email service configuration error. Missing Google OAuth Credentials.' });
    }

    try {
      await sendEmailHTTP(
        email, 
        'Reset your WatchTogether Password', 
        PWDEmailHtml(email, 'Reset your WatchTogether Password', user.display_name, code)
      );
    } catch (error) {
      console.error('Google API Error:', error);
      return res.status(500).json({ error: 'Failed to send email via Google API.' });
    }

    res.json({ success: true, message: 'Reset code sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    const record = await prisma.verificationCode.findUnique({ where: { email } });
    if (!record || record.code !== code) return res.status(400).json({ error: 'Invalid code' });
    if (record.expiresAt < new Date()) return res.status(400).json({ error: 'Code expired' });

    // Mark as verified by clearing code
    await prisma.verificationCode.update({
      where: { email },
      data: { code: 'VERIFIED' }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    const record = await prisma.verificationCode.findUnique({ where: { email } });
    if (!record || record.code !== 'VERIFIED') return res.status(400).json({ error: 'Not verified' });

    const password_hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password_hash }
    });

    await prisma.verificationCode.delete({ where: { email } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Standard Auth ---

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
