const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const auth   = require('../middleware/auth');

router.use(auth);
router.get('/stats',             ctrl.getStats);
router.get('/monthly-attendance', ctrl.getMonthlyAttendance);
router.get('/salary-by-dept',     ctrl.getSalaryByDept);
router.get('/department-stats',   ctrl.getDepartmentStats);
router.get('/recent-activity',    ctrl.getRecentActivity);

module.exports = router;
