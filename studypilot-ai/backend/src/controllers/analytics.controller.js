const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [[profile]] = await pool.query('SELECT streak_count, longest_streak, xp_points, level, daily_study_minutes FROM learning_profiles WHERE user_id = ?', [userId]);
  const [[topicsStats]] = await pool.query(
    `SELECT COUNT(*) AS total, SUM(status='completed') AS completed,
            SUM(strength='weak') AS weak, SUM(strength='strong') AS strong
     FROM user_topic_progress WHERE user_id = ?`, [userId]
  );
  const [[quizStats]] = await pool.query(
    `SELECT COUNT(*) AS total_quizzes, AVG(score/total*100) AS avg_score
     FROM quiz_attempts WHERE user_id = ?`, [userId]
  );
  const [[minutesToday]] = await pool.query(
    `SELECT COALESCE(SUM(minutes_spent),0) AS minutes FROM activity_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`, [userId]
  );
  const [[tasksToday]] = await pool.query(
    `SELECT COUNT(*) AS total, SUM(status='completed') AS completed FROM study_tasks WHERE user_id = ? AND scheduled_date = CURDATE()`, [userId]
  );
  const [dueRevisions] = await pool.query(
    `SELECT COUNT(*) AS due FROM revision_items WHERE user_id = ? AND status='active' AND next_review_date <= CURDATE()`, [userId]
  );

  res.json({
    success: true,
    data: {
      profile: profile || {},
      topics: topicsStats,
      quizzes: { totalQuizzes: quizStats.total_quizzes || 0, avgScore: Math.round(quizStats.avg_score || 0) },
      minutesToday: minutesToday.minutes,
      tasksToday,
      dueRevisions: dueRevisions[0].due,
    },
  });
});

exports.getActivityTrend = asyncHandler(async (req, res) => {
  const { days = 14 } = req.query;
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS date, SUM(minutes_spent) AS minutes, SUM(xp_earned) AS xp
     FROM activity_logs WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at) ORDER BY date ASC`,
    [req.user.id, Number(days)]
  );
  res.json({ success: true, data: rows });
});

exports.getSubjectBreakdown = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.name AS subject, s.color, COUNT(*) AS topics_tracked,
            ROUND(AVG(p.mastery_score),1) AS avg_mastery
     FROM user_topic_progress p
     JOIN topics t ON t.id = p.topic_id
     JOIN subjects s ON s.id = t.subject_id
     WHERE p.user_id = ? GROUP BY s.id, s.name, s.color`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

exports.getQuizPerformanceTrend = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.completed_at, ROUND(a.score/a.total*100,1) AS score_pct, q.title
     FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.user_id = ? ORDER BY a.completed_at ASC LIMIT 30`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

exports.getModeDistribution = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT mode, COUNT(*) AS sessions, SUM(duration_seconds) AS total_seconds
     FROM learning_sessions WHERE user_id = ? GROUP BY mode`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});
