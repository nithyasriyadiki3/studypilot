const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/summary', ctrl.getDashboardSummary);
router.get('/activity-trend', ctrl.getActivityTrend);
router.get('/subject-breakdown', ctrl.getSubjectBreakdown);
router.get('/quiz-performance', ctrl.getQuizPerformanceTrend);
router.get('/mode-distribution', ctrl.getModeDistribution);

module.exports = router;
