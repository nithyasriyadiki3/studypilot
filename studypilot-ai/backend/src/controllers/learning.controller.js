const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const gemini = require('../services/gemini.service');

// ---------------- Catalog ----------------
exports.getSubjects = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM subjects ORDER BY name');
  res.json({ success: true, data: rows });
});

exports.getTopics = asyncHandler(async (req, res) => {
  const { subjectId } = req.query;
  const params = [req.user.id];
  let where = '';
  if (subjectId) {
    where = 'WHERE t.subject_id = ?';
    params.push(subjectId);
  }
  const [rows] = await pool.query(
    `SELECT t.*, s.name AS subject_name, s.color AS subject_color,
            p.status, p.mastery_score, p.strength, p.attempts_count, p.last_practiced_at
     FROM topics t
     JOIN subjects s ON s.id = t.subject_id
     LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
     ${where}
     ORDER BY s.name, t.order_index`,
    params
  );
  res.json({ success: true, data: rows });
});

// ---------------- Progress ----------------
exports.upsertTopicProgress = asyncHandler(async (req, res) => {
  const { topicId, status, masteryScore } = req.body;
  if (!topicId) return res.status(400).json({ success: false, message: 'topicId is required.' });

  let strength = 'average';
  if (masteryScore !== undefined) {
    strength = masteryScore >= 75 ? 'strong' : masteryScore < 45 ? 'weak' : 'average';
  }

  await pool.query(
    `INSERT INTO user_topic_progress (user_id, topic_id, status, mastery_score, strength, attempts_count, last_practiced_at)
     VALUES (?, ?, COALESCE(?, 'in_progress'), COALESCE(?, 0), ?, 1, NOW())
     ON DUPLICATE KEY UPDATE
       status = COALESCE(VALUES(status), status),
       mastery_score = COALESCE(VALUES(mastery_score), mastery_score),
       strength = VALUES(strength),
       attempts_count = attempts_count + 1,
       last_practiced_at = NOW()`,
    [req.user.id, topicId, status || null, masteryScore ?? null, strength]
  );
  res.json({ success: true, message: 'Progress updated.' });
});

exports.getWeakStrongTopics = asyncHandler(async (req, res) => {
  const [weak] = await pool.query(
    `SELECT t.id, t.name, s.name AS subject_name, p.mastery_score, p.attempts_count
     FROM user_topic_progress p JOIN topics t ON t.id = p.topic_id JOIN subjects s ON s.id = t.subject_id
     WHERE p.user_id = ? AND p.strength = 'weak' ORDER BY p.mastery_score ASC LIMIT 10`,
    [req.user.id]
  );
  const [strong] = await pool.query(
    `SELECT t.id, t.name, s.name AS subject_name, p.mastery_score, p.attempts_count
     FROM user_topic_progress p JOIN topics t ON t.id = p.topic_id JOIN subjects s ON s.id = t.subject_id
     WHERE p.user_id = ? AND p.strength = 'strong' ORDER BY p.mastery_score DESC LIMIT 10`,
    [req.user.id]
  );
  res.json({ success: true, data: { weak, strong } });
});

// ---------------- Adaptive learning path (Gemini) ----------------
exports.generateLearningPath = asyncHandler(async (req, res) => {
  const [[profileRows], [progressRows], [subjectRows]] = await Promise.all([
    pool.query('SELECT * FROM learning_profiles WHERE user_id = ?', [req.user.id]),
    pool.query(
      `SELECT t.name AS topic, s.name AS subject, p.status, p.mastery_score, p.strength
       FROM user_topic_progress p JOIN topics t ON t.id = p.topic_id JOIN subjects s ON s.id = t.subject_id
       WHERE p.user_id = ?`,
      [req.user.id]
    ),
    pool.query('SELECT t.name AS topic, s.name AS subject, t.difficulty FROM topics t JOIN subjects s ON s.id = t.subject_id'),
  ]);

  const profile = profileRows[0] || {};
  const preferredSubjects = profile.preferred_subjects
    ? (typeof profile.preferred_subjects === 'string' ? JSON.parse(profile.preferred_subjects) : profile.preferred_subjects)
    : [];

  const systemInstruction = `You are StudyPilot AI's adaptive learning engine. You design realistic, encouraging,
personalized study roadmaps based on a learner's stated goals and their actual measured progress.
Always respond with STRICT JSON only, matching this shape:
{
  "summary": string (2-3 sentences, encouraging, specific to this learner),
  "roadmap": [
    { "phase": string, "goal": string, "topics": [string], "estimated_weeks": number }
  ],
  "recommended_next_topics": [ { "topic": string, "subject": string, "reason": string } ],
  "focus_areas": [string]
}`;

  const prompt = `Learner profile:
- Education level: ${profile.education_level || 'unspecified'}
- Primary goal: ${profile.primary_goal || 'general improvement'}
- Target role: ${profile.target_role || 'unspecified'}
- Preferred subjects: ${preferredSubjects.join(', ') || 'unspecified'}
- Daily study minutes: ${profile.daily_study_minutes || 30}

Measured topic progress (from real quiz/practice history):
${JSON.stringify(progressRows)}

Available curriculum catalog:
${JSON.stringify(subjectRows).slice(0, 6000)}

Build a personalized adaptive learning roadmap. Prioritize weak/low-mastery topics without ignoring
the learner's stated goal. Keep roadmap to 3-5 phases. Respond with JSON only.`;

  const ai = await gemini.generateJSON(prompt, systemInstruction);

  await pool.query('UPDATE learning_paths SET status = "archived" WHERE user_id = ? AND status = "active"', [req.user.id]);
  const [result] = await pool.query(
    'INSERT INTO learning_paths (user_id, ai_summary, roadmap_json) VALUES (?, ?, ?)',
    [req.user.id, ai.summary || '', JSON.stringify(ai)]
  );

  res.json({ success: true, data: { id: result.insertId, ...ai } });
});

exports.getActiveLearningPath = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM learning_paths WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
    [req.user.id]
  );
  if (!rows.length) return res.json({ success: true, data: null });
  const row = rows[0];
  const roadmap = typeof row.roadmap_json === 'string' ? JSON.parse(row.roadmap_json) : row.roadmap_json;
  res.json({ success: true, data: { id: row.id, createdAt: row.created_at, ...roadmap } });
});

// ---------------- Deep Learning Modes ----------------
const MODE_SYSTEM_PROMPTS = {
  learn: 'You are a patient, expert tutor. Explain the concept clearly with structure: definition, intuition, a small example, and a common pitfall. Use markdown headings and be concise but thorough.',
  practice: 'You are a practice coach. Given the topic, produce a hands-on practice exercise with clear instructions, and after the exercise text, a "Hints" section, without giving the full solution unless asked.',
  problem_solving: 'You are an expert problem-setting mentor for technical interviews. Present ONE realistic problem for the given topic with constraints and examples, structured like a coding interview question. Do not reveal the solution unless explicitly asked.',
  interview: 'You are simulating a rigorous but friendly technical interviewer for the given topic/role. Ask one sharp interview question at a time, and if the user answers, give brief structured feedback (strengths, gaps, what a strong answer includes) then ask a natural follow-up question.',
  case_study: 'You are a case-study facilitator (consulting/product/engineering style). Present a realistic scenario relevant to the topic, with context, constraints, and 2-3 guiding questions for the learner to reason through, before eventually providing model reasoning if asked.',
};

exports.runLearningSession = asyncHandler(async (req, res) => {
  const { mode, topicId, topicName, message, history } = req.body;
  if (!MODE_SYSTEM_PROMPTS[mode]) {
    return res.status(400).json({ success: false, message: 'Invalid mode.' });
  }
  if (!message) return res.status(400).json({ success: false, message: 'message is required.' });

  const contextHistory = Array.isArray(history) && history.length
    ? `Conversation so far:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}\n\n`
    : '';

  const prompt = `${contextHistory}Topic: ${topicName || 'General'}\nLearner message: ${message}`;
  const start = Date.now();
  const aiResponse = await gemini.generateText(prompt, MODE_SYSTEM_PROMPTS[mode]);
  const durationSeconds = Math.round((Date.now() - start) / 1000);

  const [result] = await pool.query(
    `INSERT INTO learning_sessions (user_id, topic_id, mode, prompt, ai_response, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, topicId || null, mode, message, aiResponse, durationSeconds]
  );
  await pool.query(
    'INSERT INTO activity_logs (user_id, activity_type, minutes_spent, xp_earned, reference_id) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, mode, Math.max(1, Math.round(durationSeconds / 60)), 5, result.insertId]
  );

  res.json({ success: true, data: { id: result.insertId, mode, aiResponse, createdAt: new Date() } });
});

exports.getSessionHistory = asyncHandler(async (req, res) => {
  const { mode, topicId, limit = 20 } = req.query;
  const params = [req.user.id];
  let where = 'WHERE ls.user_id = ?';
  if (mode) { where += ' AND ls.mode = ?'; params.push(mode); }
  if (topicId) { where += ' AND ls.topic_id = ?'; params.push(topicId); }
  params.push(Number(limit));

  const [rows] = await pool.query(
    `SELECT ls.*, t.name AS topic_name FROM learning_sessions ls
     LEFT JOIN topics t ON t.id = ls.topic_id
     ${where} ORDER BY ls.created_at DESC LIMIT ?`,
    params
  );
  res.json({ success: true, data: rows });
});
