const db = require('../config/db');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const [empCount]     = await db.execute("SELECT COUNT(*) AS total FROM employees WHERE status='active'");
    const [attendance]   = await db.execute('SELECT * FROM v_today_attendance_summary');
    const [payments]     = await db.execute(
      "SELECT COALESCE(SUM(net_amount),0) AS total_paid FROM payments WHERE payment_status='paid' AND MONTH(paid_at)=MONTH(NOW()) AND YEAR(paid_at)=YEAR(NOW())"
    );
    const [pending]      = await db.execute(
      "SELECT COUNT(*) AS count, COALESCE(SUM(net_amount),0) AS total FROM payments WHERE payment_status='pending'"
    );
    const [newEmployees] = await db.execute(
      "SELECT COUNT(*) AS count FROM employees WHERE MONTH(joining_date)=MONTH(NOW()) AND YEAR(joining_date)=YEAR(NOW())"
    );

    res.json({
      success: true,
      data: {
        total_employees:    empCount[0].total,
        attendance_today:   attendance[0],
        salary_paid_month:  payments[0].total_paid,
        pending_payments:   pending[0],
        new_employees_month: newEmployees[0].count,
      }
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/monthly-attendance?year=2024
exports.getMonthlyAttendance = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      `SELECT
         MONTH(attendance_date) AS month,
         SUM(status='present')  AS present,
         SUM(status='absent')   AS absent,
         SUM(status='half_day') AS half_day
       FROM attendance
       WHERE YEAR(attendance_date) = ?
       GROUP BY MONTH(attendance_date)
       ORDER BY month`,
      [year]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/dashboard/salary-by-dept
exports.getSalaryByDept = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         d.name AS department,
         COALESCE(SUM(p.net_amount),0) AS total,
         COALESCE(SUM(CASE WHEN p.payment_status = 'paid' THEN p.net_amount ELSE 0 END),0) AS paid,
         COALESCE(SUM(CASE WHEN p.payment_status = 'pending' THEN p.net_amount ELSE 0 END),0) AS pending,
         COALESCE(SUM(CASE WHEN p.payment_period = 'daily' THEN p.net_amount ELSE 0 END),0) AS daily,
         COALESCE(SUM(CASE WHEN p.payment_period = 'weekly' THEN p.net_amount ELSE 0 END),0) AS weekly,
         COALESCE(SUM(CASE WHEN p.payment_period = 'monthly' THEN p.net_amount ELSE 0 END),0) AS monthly,
         COALESCE(SUM(CASE WHEN p.payment_period = 'advance' THEN p.net_amount ELSE 0 END),0) AS advance,
         COALESCE(SUM(CASE WHEN p.payment_period = 'bonus' THEN p.net_amount ELSE 0 END),0) AS bonus,
         COALESCE(SUM(CASE WHEN p.payment_period = 'deduction' THEN p.net_amount ELSE 0 END),0) AS deduction
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id
       LEFT JOIN payments p ON p.employee_id = e.id
       GROUP BY d.id, d.name
       ORDER BY total DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/dashboard/recent-activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT al.*, u.name AS user_name
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT 20`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
