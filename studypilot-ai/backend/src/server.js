require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { scheduleDailyJobs } = require('./services/cron.service');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api', limiter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'StudyPilot AI API is running.' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/learning', require('./routes/learning.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/planner', require('./routes/planner.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await testConnection();
  scheduleDailyJobs();
  app.listen(PORT, () => {
    console.log(`🚀 StudyPilot AI API listening on http://localhost:${PORT}`);
  });
})();
