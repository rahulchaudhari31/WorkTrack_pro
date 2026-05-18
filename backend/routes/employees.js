const router    = require('express').Router();
const ctrl      = require('../controllers/employeeController');
const auth      = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth); // All employee routes require authentication

router.get('/',                     ctrl.getEmployees);
router.get('/departments',          ctrl.getDepartments);
router.get('/:id',                  ctrl.getEmployee);
router.post('/',    roleCheck('admin','manager'), ctrl.createEmployee);
router.patch('/:id/status', roleCheck('admin','manager'), ctrl.updateEmployeeStatus);
router.put('/:id',  roleCheck('admin','manager'), ctrl.updateEmployee);
router.delete('/:id', roleCheck('admin'),         ctrl.deleteEmployee);

module.exports = router;
