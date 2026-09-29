const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.listNotifications);
router.post('/', ctrl.createNotification);
router.put('/:id/read', ctrl.markRead);
router.put('/read-all', ctrl.markAllRead);
router.delete('/:id', ctrl.deleteNotification);

module.exports = router;
