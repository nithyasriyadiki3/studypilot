const router = require('express').Router();
const ctrl = require('../controllers/planner.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/plans', ctrl.createPlan);
router.get('/plans', ctrl.listPlans);
router.delete('/plans/:id', ctrl.deletePlan);

router.post('/tasks', ctrl.createTask);
router.get('/tasks', ctrl.listTasks);
router.put('/tasks/:id', ctrl.updateTask);
router.delete('/tasks/:id', ctrl.deleteTask);

router.post('/revision', ctrl.createRevisionItem);
router.get('/revision', ctrl.listRevisionItems);
router.post('/revision/:id/review', ctrl.reviewRevisionItem);
router.delete('/revision/:id', ctrl.deleteRevisionItem);

module.exports = router;
