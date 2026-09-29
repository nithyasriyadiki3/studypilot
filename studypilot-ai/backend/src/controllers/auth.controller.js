const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing.length) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name.trim(), email.toLowerCase().trim(), passwordHash]
  );

  const userId = result.insertId;
  await pool.query('INSERT INTO learning_profiles (user_id) VALUES (?)', [userId]);
  await pool.query(
    'INSERT INTO notifications (user_id, type, title, message) VALUES (?, "system", ?, ?)',
    [userId, 'Welcome to StudyPilot AI 🎉', 'Complete your learning profile to unlock your personalized roadmap.']
  );

  const payload = { id: userId, email: email.toLowerCase(), name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
    [userId, hashToken(refreshToken)]
  );

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user: { id: userId, name, email }, accessToken, refreshToken },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, avatar_url, theme FROM users WHERE email = ? AND is_active = TRUE',
    [email.toLowerCase()]
  );
  if (!rows.length) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const payload = { id: user.id, email: user.email, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
    [user.id, hashToken(refreshToken)]
  );

  delete user.password_hash;
  res.json({ success: true, message: 'Logged in successfully.', data: { user, accessToken, refreshToken } });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required.' });

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  const [rows] = await pool.query(
    'SELECT id FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()',
    [decoded.id, hashToken(refreshToken)]
  );
  if (!rows.length) {
    return res.status(401).json({ success: false, message: 'Refresh token not recognized. Please log in again.' });
  }

  const payload = { id: decoded.id, email: decoded.email, name: decoded.name };
  const accessToken = signAccessToken(payload);
  res.json({ success: true, data: { accessToken } });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [hashToken(refreshToken)]);
  }
  res.json({ success: true, message: 'Logged out.' });
});

exports.me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, avatar_url, theme, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, data: rows[0] });
});
