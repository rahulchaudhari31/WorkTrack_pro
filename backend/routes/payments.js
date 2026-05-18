const router    = require('express').Router();
const ctrl      = require('../controllers/paymentController');
const auth      = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.get('/',                             ctrl.getPayments);
router.get('/pending-summary',              ctrl.getPendingSummary);
router.post('/calculate',                   ctrl.calculatePayment);
router.post('/',                roleCheck('admin','manager'), ctrl.createPayment);
router.patch('/:id/mark-paid',   roleCheck('admin'), ctrl.markPaid);
router.patch('/:id/status',      roleCheck('admin'), ctrl.updatePaymentStatus);

module.exports = router;
