const db   = require('../config/db');

// GET /api/employees  — paginated + search + filter
exports.getEmployees = async (req, res, next) => {
  try {
    const {
      page     = 1,
      limit    = 10,
      search   = '',
      status   = '',
      dept_id  = '',
      salary_type = '',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let   where  = 'WHERE 1=1';

    if (search) {
      where += ' AND (e.full_name LIKE ? OR e.mobile_number LIKE ? OR e.employee_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status)      { where += ' AND e.status = ?';       params.push(status); }
    if (dept_id)     { where += ' AND e.department_id = ?'; params.push(dept_id); }
    if (salary_type) { where += ' AND e.salary_type = ?';  params.push(salary_type); }

    const [rows] = await db.execute(
      `SELECT e.id, e.employee_code, e.full_name, e.mobile_number, e.designation,
              e.salary_type, e.daily_wage, e.monthly_salary, e.status,
              e.joining_date, e.profile_photo, e.worker_category,
              d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM employees e ${where}`, params
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countRows[0].total / parseInt(limit)),
      }
    });
  } catch (err) { next(err); }
};

// GET /api/employees/:id
exports.getEmployee = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Employee not found' });

    const emp = rows[0];
    if (req.user.role !== 'admin') {
      emp.aadhaar_number = emp.aadhaar_number?.replace(/\d(?=\d{4})/g, '*');
      emp.bank_account_no = emp.bank_account_no?.replace(/\d(?=\d{4})/g, '*');
    }
    res.json({ success: true, data: emp });
  } catch (err) { next(err); }
};

// POST /api/employees
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      full_name, mobile_number, alternate_mobile, email, address, city, state, pincode,
      aadhaar_number, pan_number, joining_date, worker_category, designation,
      salary_type, daily_wage, monthly_salary, half_day_wage,
      bank_name, bank_account_no, bank_ifsc, bank_branch, upi_id,
      department_id, status = 'active', notes
    } = req.body;

    const [last] = await db.execute(
      'SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1'
    );
    const lastNum = last.length
      ? parseInt(last[0].employee_code.replace('EMP-', '')) + 1
      : 1;
    const employee_code = `EMP-${String(lastNum).padStart(4, '0')}`;

    const hdw = half_day_wage || (parseFloat(daily_wage || 0) / 2);

    const [result] = await db.execute(
      `INSERT INTO employees
        (employee_code, full_name, mobile_number, alternate_mobile, email,
         address, city, state, pincode, aadhaar_number, pan_number,
         joining_date, worker_category, designation, salary_type,
         daily_wage, monthly_salary, half_day_wage,
         bank_name, bank_account_no, bank_ifsc, bank_branch, upi_id,
         department_id, status, notes, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        employee_code, full_name, mobile_number, alternate_mobile || null, email || null,
        address || null, city || null, state || null, pincode || null,
        aadhaar_number || null, pan_number || null,
        joining_date, worker_category || 'daily_wage', designation || null, salary_type,
        parseFloat(daily_wage) || 0, parseFloat(monthly_salary) || 0, hdw,
        bank_name || null, bank_account_no || null, bank_ifsc || null, bank_branch || null, upi_id || null,
        department_id || null, status, notes || null, req.user.id
      ]
    );

    const [newEmp] = await db.execute('SELECT * FROM employees WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Employee created', data: newEmp[0] });
  } catch (err) { next(err); }
};

// PUT /api/employees/:id
exports.updateEmployee = async (req, res, next) => {
  try {
    const fields  = req.body;
    const setters = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values  = Object.values(fields);
    values.push(req.params.id);

    await db.execute(`UPDATE employees SET ${setters} WHERE id = ?`, values);
    const [updated] = await db.execute('SELECT * FROM employees WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Employee updated', data: updated[0] });
  } catch (err) { next(err); }
};

// DELETE /api/employees/:id  (soft delete)
exports.deleteEmployee = async (req, res, next) => {
  try {
    await db.execute(
      "UPDATE employees SET status='terminated', leaving_date=CURDATE() WHERE id=?",
      [req.params.id]
    );
    res.json({ success: true, message: 'Employee terminated' });
  } catch (err) { next(err); }
};

// GET /api/employees/departments
exports.getDepartments = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM departments ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
