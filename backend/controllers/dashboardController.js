const db = require('../config/db');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const [empCount]     = await db.execute("SELECT COUNT(*) AS total FROM employees WHERE status='active'");
    const [attendance]   = await db.execute('SELECT * FROM v_today_attendance_summary');
    const [payments]     = await db.execute(
      "SELECT COALESCE(SUM(net_amount),0) AS total_paid FROM payments WHERE payment_status IN ('paid','done') AND MONTH(paid_at)=MONTH(NOW()) AND YEAR(paid_at)=YEAR(NOW())"
    );
    const [pending]      = await db.execute(
      "SELECT COUNT(*) AS count, COALESCE(SUM(net_amount),0) AS total FROM payments WHERE payment_status IN ('pending','paid')"
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
         dept.department,
         dept.department_id,
         COALESCE(emp.employee_count, 0) AS employee_count,
         CASE
           WHEN COALESCE(pay.payment_count, 0) > 0 THEN COALESCE(pay.total_payments, 0)
           ELSE COALESCE(emp.estimated_salary, 0)
         END AS total,
         COALESCE(emp.estimated_salary, 0) AS estimated_salary,
         COALESCE(pay.payment_count, 0) AS payment_count,
         COALESCE(pay.total_payments, 0) AS total_payments,
         COALESCE(pay.paid, 0) AS paid,
         COALESCE(pay.pending, 0) AS pending,
         COALESCE(pay.daily, 0) AS daily,
         COALESCE(pay.weekly, 0) AS weekly,
         COALESCE(pay.monthly, 0) AS monthly,
         COALESCE(pay.advance, 0) AS advance,
         COALESCE(pay.bonus, 0) AS bonus,
         COALESCE(pay.deduction, 0) AS deduction
       FROM (
         SELECT d.id AS department_id, d.name AS department
         FROM departments d
         UNION
         SELECT NULL AS department_id, e.department_id AS department
         FROM employees e
         LEFT JOIN departments d
           ON d.name = e.department_id
           OR CAST(d.id AS CHAR) = CAST(e.department_id AS CHAR)
         WHERE e.department_id IS NOT NULL
           AND e.department_id <> ''
           AND d.id IS NULL
         GROUP BY e.department_id
       ) dept
       LEFT JOIN (
         SELECT
           COALESCE(d.name, e.department_id) AS department,
           COUNT(*) AS employee_count,
           SUM(
             CASE
               WHEN salary_type = 'monthly' AND COALESCE(monthly_salary, 0) > 0 THEN monthly_salary
               ELSE COALESCE(daily_wage, 0) * 26
             END
           ) AS estimated_salary
         FROM employees e
         LEFT JOIN departments d
           ON d.name = e.department_id
           OR CAST(d.id AS CHAR) = CAST(e.department_id AS CHAR)
         WHERE e.status = 'active'
         GROUP BY COALESCE(d.name, e.department_id)
       ) emp ON emp.department = dept.department
       LEFT JOIN (
         SELECT
           COALESCE(d.name, e.department_id) AS department,
           COUNT(p.id) AS payment_count,
           COALESCE(SUM(p.net_amount), 0) AS total_payments,
           COALESCE(SUM(CASE WHEN p.payment_status IN ('paid','done') THEN p.net_amount ELSE 0 END), 0) AS paid,
           COALESCE(SUM(CASE WHEN p.payment_status IN ('pending','paid') THEN p.net_amount ELSE 0 END), 0) AS pending,
           COALESCE(SUM(CASE WHEN p.payment_period = 'daily' THEN p.net_amount ELSE 0 END), 0) AS daily,
           COALESCE(SUM(CASE WHEN p.payment_period = 'weekly' THEN p.net_amount ELSE 0 END), 0) AS weekly,
           COALESCE(SUM(CASE WHEN p.payment_period = 'monthly' THEN p.net_amount ELSE 0 END), 0) AS monthly,
           COALESCE(SUM(CASE WHEN p.payment_period = 'advance' THEN p.net_amount ELSE 0 END), 0) AS advance,
           COALESCE(SUM(CASE WHEN p.payment_period = 'bonus' THEN p.net_amount ELSE 0 END), 0) AS bonus,
           COALESCE(SUM(CASE WHEN p.payment_period = 'deduction' THEN p.net_amount ELSE 0 END), 0) AS deduction
         FROM payments p
         JOIN employees e ON e.id = p.employee_id
         LEFT JOIN departments d
           ON d.name = e.department_id
           OR CAST(d.id AS CHAR) = CAST(e.department_id AS CHAR)
         WHERE e.status = 'active'
         GROUP BY COALESCE(d.name, e.department_id)
       ) pay ON pay.department = dept.department
       ORDER BY total DESC, dept.department ASC`
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

// GET /api/dashboard/department-stats
exports.getDepartmentStats = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         d.id,
         d.name AS department,
         d.description,
         COUNT(DISTINCT e.id) AS total_employees,
         COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) AS active_employees,
         COUNT(DISTINCT CASE WHEN e.status = 'inactive' THEN e.id END) AS inactive_employees,
         COALESCE(SUM(p.net_amount), 0) AS total_payments,
         COALESCE(SUM(CASE WHEN p.payment_status IN ('paid','done') THEN p.net_amount ELSE 0 END), 0) AS paid_amount,
         COALESCE(SUM(CASE WHEN p.payment_status IN ('pending','paid') THEN p.net_amount ELSE 0 END), 0) AS pending_amount
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id
       LEFT JOIN payments p ON p.employee_id = e.id
       GROUP BY d.id, d.name, d.description
       ORDER BY active_employees DESC, d.name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
