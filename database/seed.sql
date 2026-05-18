USE worktrack_pro;

INSERT INTO employees
  (employee_code, full_name, mobile_number, address, aadhaar_number,
   joining_date, worker_category, designation, salary_type, daily_wage, half_day_wage,
   department_id, status)
VALUES
  ('EMP-0001', 'Rajesh Kumar',     '9876543210', 'Pune, Maharashtra', '1234-5678-9012', '2024-01-15', 'daily_wage', 'Construction Worker', 'daily', 650.00, 325.00, 2, 'active'),
  ('EMP-0002', 'Priya Sharma',     '9876543211', 'Mumbai, Maharashtra','2345-6789-0123', '2024-02-01', 'permanent',  'Site Supervisor',     'daily', 900.00, 450.00, 2, 'active'),
  ('EMP-0003', 'Mohammad Ali',     '9876543212', 'Nashik, Maharashtra','3456-7890-1234', '2024-01-20', 'contract',   'Electrician',         'daily', 750.00, 375.00, 3, 'active'),
  ('EMP-0004', 'Sunita Devi',      '9876543213', 'Aurangabad, MH',    '4567-8901-2345', '2024-03-01', 'daily_wage', 'Housekeeping Staff',  'daily', 500.00, 250.00, 5, 'active'),
  ('EMP-0005', 'Vijay Patil',      '9876543214', 'Solapur, Maharashtra','5678-9012-3456','2023-11-15', 'permanent',  'Security Guard',      'daily', 600.00, 300.00, 4, 'active'),
  ('EMP-0006', 'Kavitha Reddy',    '9876543215', 'Hyderabad, TS',     '6789-0123-4567', '2024-04-01', 'daily_wage', 'Painter',             'daily', 700.00, 350.00, 2, 'active');

INSERT INTO attendance (employee_id, attendance_date, status, time_in, time_out, marked_by)
SELECT
  e.id,
  DATE_SUB(CURDATE(), INTERVAL n.n DAY),
  ELT(FLOOR(RAND()*5)+1, 'present','present','present','absent','half_day'),
  '09:00:00',
  '18:00:00',
  1
FROM employees e
CROSS JOIN (
  SELECT 0 n UNION SELECT 1 UNION SELECT 2
  UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) n
WHERE e.status = 'active'
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO holidays (name, holiday_date, holiday_type) VALUES
('Republic Day',         '2025-01-26', 'national'),
('Holi',                 '2025-03-25', 'national'),
('Independence Day',     '2025-08-15', 'national'),
('Gandhi Jayanti',       '2025-10-02', 'national'),
('Diwali',               '2025-10-20', 'national'),
('Christmas',            '2025-12-25', 'national');

INSERT INTO payments
  (payment_code, employee_id, payment_period, period_from, period_to,
   working_days, present_days, half_days, absent_days,
   base_amount, net_amount, payment_method, payment_status, paid_at, paid_by)
VALUES
  ('PAY-20240601-0001', 1, 'weekly', '2024-06-01', '2024-06-07', 6, 5, 1, 0, 3575.00, 3575.00, 'cash',         'paid', NOW(), 1),
  ('PAY-20240601-0002', 2, 'weekly', '2024-06-01', '2024-06-07', 6, 6, 0, 0, 5400.00, 5400.00, 'bank_transfer', 'paid', NOW(), 1),
  ('PAY-20240608-0001', 3, 'weekly', '2024-06-08', '2024-06-14', 6, 4, 1, 1, 3375.00, 3375.00, 'upi',           'pending', NULL, NULL);
