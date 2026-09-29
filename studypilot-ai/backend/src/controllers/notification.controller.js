const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.listNotifications = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
  const [[{ unread }]] = await pool.query('SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE', [req.user.id]);
  res.json({ success: true, data: rows, unread });
});

exports.markRead = asyncHandler(async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Marked as read.' });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
  res.json({ success: true, message: 'All notifications marked as read.' });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Notification deleted.' });
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { type, title, message, actionUrl } = req.body;
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, type, title, message, action_url) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, type || 'system', title, message, actionUrl || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});
