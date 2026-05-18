const db = require('../config/db');

// GET /api/payments — list all payments
exports.getPayments = async (req, res, next) => {
  try {
    const { page=1, limit=10, status='', employee_id='', period='', department_id='' } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (status)        { where += ' AND p.payment_status=?'; params.push(status); }
    if (employee_id)   { where += ' AND p.employee_id=?';    params.push(employee_id); }
    if (period)        { where += ' AND p.payment_period=?'; params.push(period); }
    if (department_id) {
      where += ' AND (e.department_id=? OR CAST(d.id AS CHAR)=CAST(? AS CHAR) OR d.name=?)';
      params.push(department_id, department_id, department_id);
    }

    const [rows] = await db.execute(
      `SELECT p.*, e.full_name, e.employee_code, e.daily_wage, e.department_id,
              COALESCE(d.name, e.department_id) AS department_name
       FROM payments p
       JOIN employees e ON e.id = p.employee_id
       LEFT JOIN departments d
         ON d.name = e.department_id
         OR CAST(d.id AS CHAR) = CAST(e.department_id AS CHAR)
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    const [cnt] = await db.execute(
      `SELECT COUNT(*) AS total, SUM(net_amount) AS total_amount
       FROM payments p
       JOIN employees e ON e.id = p.employee_id
       LEFT JOIN departments d
         ON d.name = e.department_id
         OR CAST(d.id AS CHAR) = CAST(e.department_id AS CHAR)
       ${where}`, params
    );

    res.json({ success: true, data: rows, pagination: {
      total: cnt[0].total, total_amount: cnt[0].total_amount,
      page: parseInt(page), limit: parseInt(limit),
      pages: Math.ceil(cnt[0].total/parseInt(limit))
    }});
  } catch (err) { next(err); }
};

// POST /api/payments/calculate — calculate payment for employee
exports.calculatePayment = async (req, res, next) => {
  try {
    const { employee_id, period_from, period_to, payment_period } = req.body;
    const [empRows] = await db.execute('SELECT * FROM employees WHERE id=?', [employee_id]);
    if (!empRows.length) return res.status(404).json({ success: false, message: 'Employee not found' });
    const emp = empRows[0];

    const [attRows] = await db.execute(
      `SELECT status, overtime_hours FROM attendance
       WHERE employee_id=? AND attendance_date BETWEEN ? AND ?`,
      [employee_id, period_from, period_to]
    );

    const present   = attRows.filter(r => r.status === 'present').length;
    const halfDays  = attRows.filter(r => r.status === 'half_day').length;
    const overtime  = attRows.reduce((s, r) => s + parseFloat(r.overtime_hours || 0), 0);
    const workDays  = attRows.length;

    let baseAmount = 0;
    if (emp.salary_type === 'monthly') {
      const totalDays = new Date(period_to) - new Date(period_from);
      const days = Math.round(totalDays / (1000*60*60*24)) + 1;
      const dailyRate = parseFloat(emp.monthly_salary) / 26;
      baseAmount = dailyRate * (present + halfDays * 0.5);
    } else {
      baseAmount = (present * parseFloat(emp.daily_wage)) +
                   (halfDays * parseFloat(emp.half_day_wage));
    }

    const overtimeRate   = parseFloat(emp.daily_wage) / 8 * 1.5;
    const overtimeAmount = overtime * overtimeRate;
    const netAmount      = baseAmount + overtimeAmount;

    res.json({
      success: true,
      data: {
        employee: { id: emp.id, name: emp.full_name, code: emp.employee_code },
        period: { from: period_from, to: period_to, payment_period },
        breakdown: {
          working_days: workDays, present_days: present,
          half_days: halfDays, absent_days: workDays - present - halfDays,
          overtime_hours: overtime,
        },
        amounts: {
          base_amount: baseAmount.toFixed(2),
          overtime_amount: overtimeAmount.toFixed(2),
          overtime_rate: overtimeRate.toFixed(2),
          net_amount: netAmount.toFixed(2),
        }
      }
    });
  } catch (err) { next(err); }
};

// POST /api/payments — create payment record
exports.createPayment = async (req, res, next) => {
  try {
    const {
      employee_id, payment_period, period_from, period_to,
      working_days, present_days, half_days, absent_days,
      overtime_hours=0, overtime_rate=0,
      base_amount, overtime_amount=0, bonus_amount=0,
      deduction_amount=0, advance_deduction=0, net_amount,
      payment_method, notes
    } = req.body;

    const today = new Date().toISOString().split('T')[0].replace(/-/g,'');
    const [cnt]  = await db.execute('SELECT COUNT(*) AS c FROM payments WHERE DATE(created_at)=CURDATE()');
    const code   = `PAY-${today}-${String(cnt[0].c + 1).padStart(4, '0')}`;

    const [result] = await db.execute(
      `INSERT INTO payments
         (payment_code, employee_id, payment_period, period_from, period_to,
          working_days, present_days, half_days, absent_days,
          overtime_hours, overtime_rate, base_amount, overtime_amount,
          bonus_amount, deduction_amount, advance_deduction, net_amount,
          payment_method, payment_status, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`,
      [code, employee_id, payment_period, period_from, period_to,
       working_days||0, present_days||0, half_days||0, absent_days||0,
       overtime_hours, overtime_rate, base_amount, overtime_amount,
       bonus_amount, deduction_amount, advance_deduction, net_amount,
       payment_method, notes||null]
    );

    const [newPay] = await db.execute('SELECT * FROM payments WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Payment created', data: newPay[0] });
  } catch (err) { next(err); }
};

// PATCH /api/payments/:id/mark-paid
exports.markPaid = async (req, res, next) => {
  try {
    const { transaction_ref } = req.body;
    await db.execute(
      `UPDATE payments SET payment_status='paid', paid_at=NOW(), transaction_ref=?, paid_by=?
       WHERE id=?`,
      [transaction_ref||null, req.user.id, req.params.id]
    );
    res.json({ success: true, message: 'Payment marked as paid' });
  } catch (err) { next(err); }
};

// PATCH /api/payments/:id/status — update payment status to any value
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['paid', 'done'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    let query = 'UPDATE payments SET payment_status=?';
    const params = [status];

    query += ', paid_at=COALESCE(paid_at, NOW()), paid_by=COALESCE(paid_by, ?)';
    params.push(req.user.id);

    query += ' WHERE id=?';
    params.push(req.params.id);

    await db.execute(query, params);
    
    const [updated] = await db.execute('SELECT * FROM payments WHERE id=?', [req.params.id]);
    res.json({ 
      success: true, 
      message: `Payment status updated to ${status}`,
      data: updated[0]
    });
  } catch (err) { next(err); }
};

// GET /api/payments/pending-summary — total pending for dashboard
exports.getPendingSummary = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS count, COALESCE(SUM(net_amount),0) AS total
       FROM payments WHERE payment_status IN ('pending','paid')`
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};
