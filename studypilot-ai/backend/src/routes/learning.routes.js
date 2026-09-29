const router = require('express').Router();
const ctrl = require('../controllers/learning.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/subjects', ctrl.getSubjects);
router.get('/topics', ctrl.getTopics);
router.post('/progress', ctrl.upsertTopicProgress);
router.get('/progress/weak-strong', ctrl.getWeakStrongTopics);
router.post('/roadmap/generate', ctrl.generateLearningPath);
router.get('/roadmap/active', ctrl.getActiveLearningPath);
router.post('/session', ctrl.runLearningSession);
router.get('/session/history', ctrl.getSessionHistory);

module.exports = router;
