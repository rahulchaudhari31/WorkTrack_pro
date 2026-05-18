-- ============================================================
-- Test Department Visibility - Run this to verify the fix
-- ============================================================

USE worktrack_pro;

-- Test 1: Check all departments exist
SELECT '=== TEST 1: All Departments ===' AS test;
SELECT id, name, description FROM departments ORDER BY id;

-- Test 2: Check employees with departments
SELECT '=== TEST 2: Employees by Department ===' AS test;
SELECT 
  d.name AS department,
  COUNT(e.id) AS total_employees,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) AS active,
  COUNT(CASE WHEN e.status = 'inactive' THEN 1 END) AS inactive
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY d.id;

-- Test 3: Check payments by department (what dashboard shows)
SELECT '=== TEST 3: Salary by Department (Dashboard Query) ===' AS test;
SELECT
  d.name AS department,
  d.id AS department_id,
  COUNT(DISTINCT e.id) AS employee_count,
  COALESCE(SUM(p.net_amount),0) AS total,
  COALESCE(SUM(CASE WHEN p.payment_status IN ('paid','done') THEN p.net_amount ELSE 0 END),0) AS paid,
  COALESCE(SUM(CASE WHEN p.payment_status = 'pending' THEN p.net_amount ELSE 0 END),0) AS pending
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
LEFT JOIN payments p ON p.employee_id = e.id
GROUP BY d.id, d.name
ORDER BY total DESC, d.name ASC;

-- Test 4: Check payments with department info
SELECT '=== TEST 4: Recent Payments with Department ===' AS test;
SELECT 
  p.payment_code,
  e.full_name,
  d.name AS department,
  p.net_amount,
  p.payment_status
FROM payments p
JOIN employees e ON e.id = p.employee_id
LEFT JOIN departments d ON d.id = e.department_id
ORDER BY p.created_at DESC
LIMIT 5;

-- Test 5: Employees without departments (should be empty or minimal)
SELECT '=== TEST 5: Employees Without Department ===' AS test;
SELECT 
  employee_code,
  full_name,
  department_id,
  status
FROM employees
WHERE department_id IS NULL OR department_id NOT IN (SELECT id FROM departments);
