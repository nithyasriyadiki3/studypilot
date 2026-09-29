const router = require('express').Router();
const ctrl = require('../controllers/quiz.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/generate', ctrl.generateQuiz);
router.get('/', ctrl.listQuizzes);
router.get('/:id', ctrl.getQuiz);
router.post('/:id/attempt', ctrl.submitAttempt);

module.exports = router;
