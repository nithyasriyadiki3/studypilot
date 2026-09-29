const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const gemini = require('../services/gemini.service');

const QUIZ_SYSTEM = `You are StudyPilot AI's quiz generator. Create high-quality multiple-choice quiz
questions for the given topic and difficulty. Respond with STRICT JSON only, matching:
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": string (must exactly match one of the options),
      "explanation": string (1-2 sentences)
    }
  ]
}`;

exports.generateQuiz = asyncHandler(async (req, res) => {
  const { topicId, topicName, difficulty = 'beginner', numQuestions = 5 } = req.body;
  if (!topicName) return res.status(400).json({ success: false, message: 'topicName is required.' });

  const prompt = `Generate ${numQuestions} ${difficulty} multiple-choice questions about: "${topicName}".
Ensure variety, avoid trivial repeats, and keep each question self-contained. JSON only.`;

  const ai = await gemini.generateJSON(prompt, QUIZ_SYSTEM);
  const questions = ai.questions || [];
  if (!questions.length) return res.status(502).json({ success: false, message: 'AI did not return any questions.' });

  const [quizResult] = await pool.query(
    'INSERT INTO quizzes (user_id, topic_id, title, difficulty, total_questions, source) VALUES (?, ?, ?, ?, ?, "ai_generated")',
    [req.user.id, topicId || null, `${topicName} Quiz`, difficulty, questions.length]
  );
  const quizId = quizResult.insertId;

  const values = questions.map((q, idx) => [
    quizId, q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation || '', idx,
  ]);
  await pool.query(
    'INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_index) VALUES ?',
    [values]
  );

  res.status(201).json({ success: true, data: { quizId, title: `${topicName} Quiz`, difficulty, questions } });
});

exports.listQuizzes = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT q.*, t.name AS topic_name,
       (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id) AS attempt_count,
       (SELECT MAX(a.score) FROM quiz_attempts a WHERE a.quiz_id = q.id) AS best_score
     FROM quizzes q LEFT JOIN topics t ON t.id = q.topic_id
     WHERE q.user_id = ? ORDER BY q.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

exports.getQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [quizRows] = await pool.query('SELECT * FROM quizzes WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (!quizRows.length) return res.status(404).json({ success: false, message: 'Quiz not found.' });

  const [questions] = await pool.query(
    'SELECT id, question_text, options, explanation, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index',
    [id]
  );
  const parsed = questions.map((q) => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
  }));
  res.json({ success: true, data: { ...quizRows[0], questions: parsed } });
});

exports.submitAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers, timeTakenSeconds = 0 } = req.body; // [{questionId, selected}]

  const [questions] = await pool.query('SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?', [id]);
  const correctMap = new Map(questions.map((q) => [q.id, q.correct_answer]));

  let score = 0;
  const graded = (answers || []).map((a) => {
    const isCorrect = correctMap.get(a.questionId) === a.selected;
    if (isCorrect) score += 1;
    return { ...a, isCorrect };
  });

  await pool.query(
    'INSERT INTO quiz_attempts (quiz_id, user_id, score, total, time_taken_seconds, answers) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.user.id, score, questions.length, timeTakenSeconds, JSON.stringify(graded)]
  );

  const [[quizRow]] = await pool.query('SELECT topic_id FROM quizzes WHERE id = ?', [id]);
  const masteryScore = questions.length ? Math.round((score / questions.length) * 100) : 0;
  if (quizRow?.topic_id) {
    const strength = masteryScore >= 75 ? 'strong' : masteryScore < 45 ? 'weak' : 'average';
    await pool.query(
      `INSERT INTO user_topic_progress (user_id, topic_id, status, mastery_score, strength, attempts_count, last_practiced_at)
       VALUES (?, ?, 'in_progress', ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE
         mastery_score = ?, strength = ?, attempts_count = attempts_count + 1, last_practiced_at = NOW(),
         status = IF(? >= 90, 'completed', status)`,
      [req.user.id, quizRow.topic_id, masteryScore, strength, masteryScore, strength, masteryScore]
    );
  }
  await pool.query(
    'INSERT INTO activity_logs (user_id, activity_type, minutes_spent, xp_earned, reference_id) VALUES (?, "quiz", ?, ?, ?)',
    [req.user.id, Math.max(1, Math.round(timeTakenSeconds / 60)), score * 10, id]
  );

  res.json({ success: true, data: { score, total: questions.length, masteryScore, graded } });
});
