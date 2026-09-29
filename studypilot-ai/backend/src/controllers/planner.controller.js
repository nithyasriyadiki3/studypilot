const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// ================= Study Planner =================
exports.createPlan = asyncHandler(async (req, res) => {
  const { title, goal, startDate, endDate } = req.body;
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'title, startDate and endDate are required.' });
  }
  const [result] = await pool.query(
    'INSERT INTO study_plans (user_id, title, goal, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, title, goal || null, startDate, endDate]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

exports.listPlans = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, 
       (SELECT COUNT(*) FROM study_tasks t WHERE t.plan_id = p.id) AS total_tasks,
       (SELECT COUNT(*) FROM study_tasks t WHERE t.plan_id = p.id AND t.status='completed') AS completed_tasks
     FROM study_plans p WHERE p.user_id = ? ORDER BY p.start_date DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

exports.deletePlan = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM study_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Plan deleted.' });
});

// ---- Tasks ----
exports.createTask = asyncHandler(async (req, res) => {
  const { planId, topicId, title, description, scheduledDate, durationMinutes, priority } = req.body;
  if (!title || !scheduledDate) {
    return res.status(400).json({ success: false, message: 'title and scheduledDate are required.' });
  }
  const [result] = await pool.query(
    `INSERT INTO study_tasks (plan_id, user_id, topic_id, title, description, scheduled_date, duration_minutes, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [planId || null, req.user.id, topicId || null, title, description || null, scheduledDate, durationMinutes || 30, priority || 'medium']
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

exports.listTasks = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const params = [req.user.id];
  let where = 'WHERE t.user_id = ?';
  if (from) { where += ' AND t.scheduled_date >= ?'; params.push(from); }
  if (to) { where += ' AND t.scheduled_date <= ?'; params.push(to); }
  if (status) { where += ' AND t.status = ?'; params.push(status); }

  const [rows] = await pool.query(
    `SELECT t.*, tp.name AS topic_name FROM study_tasks t
     LEFT JOIN topics tp ON tp.id = t.topic_id
     ${where} ORDER BY t.scheduled_date ASC, FIELD(t.priority,'high','medium','low')`,
    params
  );
  res.json({ success: true, data: rows });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const { title, description, scheduledDate, durationMinutes, status, priority } = req.body;
  await pool.query(
    `UPDATE study_tasks SET
       title = COALESCE(?, title), description = COALESCE(?, description),
       scheduled_date = COALESCE(?, scheduled_date), duration_minutes = COALESCE(?, duration_minutes),
       status = COALESCE(?, status), priority = COALESCE(?, priority)
     WHERE id = ? AND user_id = ?`,
    [title || null, description || null, scheduledDate || null, durationMinutes || null, status || null, priority || null, req.params.id, req.user.id]
  );

  if (status === 'completed') {
    await pool.query(
      'INSERT INTO activity_logs (user_id, activity_type, minutes_spent, xp_earned, reference_id) VALUES (?, "task", ?, 8, ?)',
      [req.user.id, 15, req.params.id]
    );
  }
  res.json({ success: true, message: 'Task updated.' });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM study_tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Task deleted.' });
});

// ================= Revision Planner (SM-2 spaced repetition) =================
exports.createRevisionItem = asyncHandler(async (req, res) => {
  const { topicId, title, notes } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'title is required.' });
  const [result] = await pool.query(
    `INSERT INTO revision_items (user_id, topic_id, title, notes, next_review_date, interval_days)
     VALUES (?, ?, ?, ?, CURDATE(), 1)`,
    [req.user.id, topicId || null, title, notes || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

exports.listRevisionItems = asyncHandler(async (req, res) => {
  const { due } = req.query;
  let query = `SELECT r.*, t.name AS topic_name FROM revision_items r
               LEFT JOIN topics t ON t.id = r.topic_id WHERE r.user_id = ? AND r.status = 'active'`;
  const params = [req.user.id];
  if (due === 'true') query += ' AND r.next_review_date <= CURDATE()';
  query += ' ORDER BY r.next_review_date ASC';
  const [rows] = await pool.query(query, params);
  res.json({ success: true, data: rows });
});

/**
 * SM-2 style review: quality 0-5 (0-2 = forgot, 3-5 = recalled with increasing ease)
 */
exports.reviewRevisionItem = asyncHandler(async (req, res) => {
  const { quality } = req.body; // 0-5
  const [[item]] = await pool.query('SELECT * FROM revision_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!item) return res.status(404).json({ success: false, message: 'Revision item not found.' });

  let { interval_days: interval, ease_factor: ease, repetitions: reps } = item;
  ease = parseFloat(ease);

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  await pool.query(
    `UPDATE revision_items SET interval_days = ?, ease_factor = ?, repetitions = ?,
       next_review_date = DATE_ADD(CURDATE(), INTERVAL ? DAY), last_reviewed_at = NOW()
     WHERE id = ?`,
    [interval, ease.toFixed(2), reps, interval, req.params.id]
  );
  await pool.query(
    'INSERT INTO activity_logs (user_id, activity_type, minutes_spent, xp_earned, reference_id) VALUES (?, "revision", 5, 4, ?)',
    [req.user.id, req.params.id]
  );

  res.json({ success: true, data: { nextIntervalDays: interval, easeFactor: ease, repetitions: reps } });
});

exports.deleteRevisionItem = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM revision_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Revision item deleted.' });
});
