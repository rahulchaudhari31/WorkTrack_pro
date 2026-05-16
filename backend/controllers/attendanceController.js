const db = require('../config/db');

// GET /api/attendance?date=YYYY-MM-DD
exports.getAttendance = async (req, res, next) => {
  try {
    const { date = new Date().toISOString().split('T')[0], dept_id, status } = req.query;
    const params = [date];
    let   where  = 'AND a.attendance_date = ?';

    if (dept_id) { where += ' AND e.department_id = ?'; params.push(dept_id); }
    if (status)  { where += ' AND a.status = ?';        params.push(status); }

    const [rows] = await db.execute(
      `SELECT
         e.id AS employee_id, e.employee_code, e.full_name, e.profile_photo,
         d.name AS department_name,
         COALESCE(a.id, NULL)          AS attendance_id,
         COALESCE(a.status, 'absent') AS status,
         a.time_in, a.time_out, a.late_minutes, a.overtime_hours, a.remarks
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN attendance a ON a.employee_id = e.id ${where}
       WHERE e.status = 'active'
       ORDER BY e.full_name`,
      params
    );

    res.json({ success: true, data: rows, date });
  } catch (err) { next(err); }
};

// POST /api/attendance — mark single attendance
exports.markAttendance = async (req, res, next) => {
  try {
    const {
      employee_id, attendance_date, status,
      time_in, time_out, overtime_hours = 0, remarks
    } = req.body;

    let late_minutes = 0;
    if (time_in) {
      const [h, m] = time_in.split(':').map(Number);
      const workStartMinutes = 9 * 60;
      const inMinutes = h * 60 + m;
      if (inMinutes > workStartMinutes) late_minutes = inMinutes - workStartMinutes;
    }

    await db.execute(
      `INSERT INTO attendance
         (employee_id, attendance_date, status, time_in, time_out, overtime_hours, late_minutes, remarks, marked_by)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         status=VALUES(status), time_in=VALUES(time_in), time_out=VALUES(time_out),
         overtime_hours=VALUES(overtime_hours), late_minutes=VALUES(late_minutes),
         remarks=VALUES(remarks), marked_by=VALUES(marked_by), updated_at=NOW()`,
      [employee_id, attendance_date, status,
       time_in || null, time_out || null, overtime_hours, late_minutes,
       remarks || null, req.user.id]
    );

    res.json({ success: true, message: 'Attendance marked' });
  } catch (err) { next(err); }
};

// POST /api/attendance/bulk — mark attendance for multiple employees
exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { attendance_date, records } = req.body;
    const conn = await require('../config/db').getConnection();
    await conn.beginTransaction();

    try {
      for (const rec of records) {
        await conn.execute(
          `INSERT INTO attendance (employee_id, attendance_date, status, time_in, time_out, remarks, marked_by)
           VALUES (?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE
             status=VALUES(status), time_in=VALUES(time_in),
             time_out=VALUES(time_out), remarks=VALUES(remarks), marked_by=VALUES(marked_by)`,
          [rec.employee_id, attendance_date, rec.status,
           rec.time_in || null, rec.time_out || null, rec.remarks || null, req.user.id]
        );
      }
      await conn.commit();
      conn.release();
      res.json({ success: true, message: `${records.length} attendance records saved` });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) { next(err); }
};

// GET /api/attendance/employee/:id?month=YYYY-MM
exports.getEmployeeAttendance = async (req, res, next) => {
  try {
    const { month = new Date().toISOString().slice(0, 7) } = req.query;
    const [rows] = await db.execute(
      `SELECT attendance_date, status, time_in, time_out, overtime_hours, late_minutes, remarks
       FROM attendance
       WHERE employee_id = ? AND DATE_FORMAT(attendance_date, '%Y-%m') = ?
       ORDER BY attendance_date`,
      [req.params.id, month]
    );

    const summary = rows.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    res.json({ success: true, data: rows, summary });
  } catch (err) { next(err); }
};

// GET /api/attendance/summary/today
exports.getTodaySummary = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM v_today_attendance_summary');
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};
