const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.updateAccount = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;
  await pool.query('UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?', [
    name || null,
    avatarUrl || null,
    req.user.id,
  ]);
  res.json({ success: true, message: 'Account updated.' });
});

exports.updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  if (!['light', 'dark', 'system'].includes(theme)) {
    return res.status(400).json({ success: false, message: 'Invalid theme value.' });
  }
  await pool.query('UPDATE users SET theme = ? WHERE id = ?', [theme, req.user.id]);
  res.json({ success: true, message: 'Theme updated.' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid current and new password (min 6 chars) required.' });
  }
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
  res.json({ success: true, message: 'Password changed successfully.' });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
  res.json({ success: true, message: 'Account deleted.' });
});

// ---- Learning profile ----
exports.getLearningProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM learning_profiles WHERE user_id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Learning profile not found.' });
  const profile = rows[0];
  if (profile.preferred_subjects && typeof profile.preferred_subjects === 'string') {
    profile.preferred_subjects = JSON.parse(profile.preferred_subjects);
  }
  res.json({ success: true, data: profile });
});

exports.updateLearningProfile = asyncHandler(async (req, res) => {
  const {
    educationLevel, primaryGoal, targetRole, dailyStudyMinutes,
    preferredSubjects, learningStyle, timezone,
  } = req.body;

  await pool.query(
    `UPDATE learning_profiles SET
      education_level = COALESCE(?, education_level),
      primary_goal = COALESCE(?, primary_goal),
      target_role = COALESCE(?, target_role),
      daily_study_minutes = COALESCE(?, daily_study_minutes),
      preferred_subjects = COALESCE(?, preferred_subjects),
      learning_style = COALESCE(?, learning_style),
      timezone = COALESCE(?, timezone),
      onboarding_completed = TRUE
     WHERE user_id = ?`,
    [
      educationLevel || null,
      primaryGoal || null,
      targetRole || null,
      dailyStudyMinutes || null,
      preferredSubjects ? JSON.stringify(preferredSubjects) : null,
      learningStyle || null,
      timezone || null,
      req.user.id,
    ]
  );
  res.json({ success: true, message: 'Learning profile updated.' });
});
