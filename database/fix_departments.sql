-- ============================================================
-- Fix Departments - Ensure all departments exist
-- ============================================================

USE worktrack_pro;

-- Check if departments exist, if not insert them
INSERT INTO departments (id, name, description) VALUES
(1, 'General', 'Default department for general staff')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO departments (id, name, description) VALUES
(2, 'Construction', 'Construction & civil work')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO departments (id, name, description) VALUES
(3, 'Maintenance', 'Maintenance & repair')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO departments (id, name, description) VALUES
(4, 'Security', 'Security & surveillance')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO departments (id, name, description) VALUES
(5, 'Housekeeping', 'Housekeeping & cleaning')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Verify departments
SELECT 
  d.id,
  d.name,
  d.description,
  COUNT(e.id) AS employee_count,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) AS active_employees
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.id, d.name, d.description
ORDER BY d.id;

-- Show employees with their departments
SELECT 
  e.id,
  e.employee_code,
  e.full_name,
  e.department_id,
  d.name AS department_name,
  e.status
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
ORDER BY e.id;
