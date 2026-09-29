const cron = require('node-cron');
const { pool } = require('../config/db');

/** Runs once daily at 00:05 — resets streaks for users inactive yesterday, and
 * queues reminder notifications for users with revisions due today. */
function scheduleDailyJobs() {
  cron.schedule('5 0 * * *', async () => {
    try {
      await pool.query(
        `UPDATE learning_profiles
         SET streak_count = 0
         WHERE last_active_date IS NOT NULL AND last_active_date < DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
      );

      const [dueUsers] = await pool.query(
        `SELECT DISTINCT user_id FROM revision_items WHERE status='active' AND next_review_date = CURDATE()`
      );
      for (const row of dueUsers) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, action_url)
           VALUES (?, 'revision', 'Revision due today', 'You have topics scheduled for review today. Keep your memory fresh!', '/revision-planner')`,
          [row.user_id]
        );
      }
      console.log('✅ Daily cron: streaks + revision reminders processed.');
    } catch (err) {
      console.error('Cron job failed:', err.message);
    }
  });
}

/** Call after any learning activity to bump streak/xp. */
async function recordDailyActivity(userId, xpDelta = 0) {
  const [[profile]] = await pool.query('SELECT streak_count, longest_streak, last_active_date, xp_points FROM learning_profiles WHERE user_id = ?', [userId]);
  if (!profile) return;

  const today = new Date().toISOString().slice(0, 10);
  let { streak_count: streak, longest_streak: longest } = profile;

  if (profile.last_active_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = profile.last_active_date === yesterday ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }

  await pool.query(
    'UPDATE learning_profiles SET streak_count = ?, longest_streak = ?, last_active_date = ?, xp_points = xp_points + ?, level = FLOOR((xp_points + ?) / 500) + 1 WHERE user_id = ?',
    [streak, longest, today, xpDelta, xpDelta, userId]
  );
}

module.exports = { scheduleDailyJobs, recordDailyActivity };
