const router = require('express').Router();
const ctrl   = require('../controllers/attendanceController');
const auth   = require('../middleware/auth');

router.use(auth);
router.get('/',               ctrl.getAttendance);
router.get('/summary/today',  ctrl.getTodaySummary);
router.get('/employee/:id',   ctrl.getEmployeeAttendance);
router.post('/',              ctrl.markAttendance);
router.post('/bulk',          ctrl.bulkMarkAttendance);

module.exports = router;
