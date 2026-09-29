const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.put('/account', ctrl.updateAccount);
router.put('/theme', ctrl.updateTheme);
router.put('/password', ctrl.changePassword);
router.delete('/account', ctrl.deleteAccount);
router.get('/learning-profile', ctrl.getLearningProfile);
router.put('/learning-profile', ctrl.updateLearningProfile);

module.exports = router;
