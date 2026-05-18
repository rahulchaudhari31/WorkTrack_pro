-- ============================================================
-- WorkTrack Pro — Complete MySQL Database Schema
-- Version: 1.0.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS worktrack_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE worktrack_pro;

CREATE TABLE departments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','manager','employee') NOT NULL DEFAULT 'employee',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  avatar_url    VARCHAR(500),
  last_login    TIMESTAMP NULL,
  reset_token         VARCHAR(255),
  reset_token_expires TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE employees (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_code     VARCHAR(20) NOT NULL,
  user_id           INT UNSIGNED,
  department_id     INT UNSIGNED,
  full_name         VARCHAR(150) NOT NULL,
  mobile_number     VARCHAR(15) NOT NULL,
  alternate_mobile  VARCHAR(15),
  email             VARCHAR(191),
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  pincode           VARCHAR(10),
  aadhaar_number    VARCHAR(20),
  pan_number        VARCHAR(20),
  profile_photo     VARCHAR(500),
  joining_date      DATE NOT NULL,
  leaving_date      DATE,
  worker_category   ENUM('permanent','contract','daily_wage','intern') DEFAULT 'daily_wage',
  designation       VARCHAR(100),
  salary_type       ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
  daily_wage        DECIMAL(10,2) DEFAULT 0.00,
  monthly_salary    DECIMAL(10,2) DEFAULT 0.00,
  half_day_wage     DECIMAL(10,2) DEFAULT 0.00,
  bank_name         VARCHAR(100),
  bank_account_no   VARCHAR(30),
  bank_ifsc         VARCHAR(20),
  bank_branch       VARCHAR(100),
  upi_id            VARCHAR(100),
  status            ENUM('active','inactive','on_leave','terminated') DEFAULT 'active',
  notes             TEXT,
  created_by        INT UNSIGNED,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_employee_code (employee_code),
  UNIQUE KEY uq_aadhaar (aadhaar_number),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_salary_type (salary_type),
  INDEX idx_joining_date (joining_date),
  INDEX idx_full_name (full_name),
  INDEX idx_mobile (mobile_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  status          ENUM('present','absent','half_day','leave','holiday','week_off') NOT NULL DEFAULT 'absent',
  time_in         TIME,
  time_out        TIME,
  overtime_hours  DECIMAL(4,2) DEFAULT 0.00,
  late_minutes    SMALLINT UNSIGNED DEFAULT 0,
  early_out_mins  SMALLINT UNSIGNED DEFAULT 0,
  remarks         VARCHAR(255),
  marked_by       INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_date (employee_id, attendance_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (attendance_date),
  INDEX idx_status (status),
  INDEX idx_emp_date (employee_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE leaves (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id   INT UNSIGNED NOT NULL,
  leave_type    ENUM('casual','sick','earned','unpaid','maternity','paternity') DEFAULT 'casual',
  from_date     DATE NOT NULL,
  to_date       DATE NOT NULL,
  total_days    TINYINT UNSIGNED NOT NULL,
  reason        TEXT,
  status        ENUM('pending','approved','rejected') DEFAULT 'pending',
  approved_by   INT UNSIGNED,
  approved_at   TIMESTAMP NULL,
  rejection_reason VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_from_date (from_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_code      VARCHAR(30) NOT NULL,
  employee_id       INT UNSIGNED NOT NULL,
  payment_period    ENUM('daily','weekly','monthly','advance','bonus','deduction') NOT NULL,
  period_from       DATE NOT NULL,
  period_to         DATE NOT NULL,
  working_days      SMALLINT UNSIGNED DEFAULT 0,
  present_days      SMALLINT UNSIGNED DEFAULT 0,
  half_days         SMALLINT UNSIGNED DEFAULT 0,
  absent_days       SMALLINT UNSIGNED DEFAULT 0,
  overtime_hours    DECIMAL(6,2) DEFAULT 0.00,
  overtime_rate     DECIMAL(10,2) DEFAULT 0.00,
  base_amount       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  overtime_amount   DECIMAL(12,2) DEFAULT 0.00,
  bonus_amount      DECIMAL(12,2) DEFAULT 0.00,
  deduction_amount  DECIMAL(12,2) DEFAULT 0.00,
  advance_deduction DECIMAL(12,2) DEFAULT 0.00,
  net_amount        DECIMAL(12,2) NOT NULL,
  payment_method    ENUM('cash','bank_transfer','upi','cheque') NOT NULL DEFAULT 'cash',
  payment_status    ENUM('pending','paid','failed','cancelled','done') DEFAULT 'pending',
  paid_at           TIMESTAMP NULL,
  transaction_ref   VARCHAR(100),
  notes             TEXT,
  paid_by           INT UNSIGNED,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_code (payment_code),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_payment_period (payment_period),
  INDEX idx_period_from (period_from),
  INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE advances (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id   INT UNSIGNED NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  reason        TEXT,
  given_date    DATE NOT NULL,
  repaid_amount DECIMAL(12,2) DEFAULT 0.00,
  status        ENUM('outstanding','partially_repaid','fully_repaid') DEFAULT 'outstanding',
  given_by      INT UNSIGNED,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  FOREIGN KEY (given_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE holidays (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  holiday_date  DATE NOT NULL,
  holiday_type  ENUM('national','company','optional') DEFAULT 'national',
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_holiday_date (holiday_date),
  INDEX idx_holiday_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   INT UNSIGNED,
  description TEXT,
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  type        ENUM('info','success','warning','error') DEFAULT 'info',
  is_read     TINYINT(1) DEFAULT 0,
  link        VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE PROCEDURE sp_calculate_payment(
  IN p_employee_id INT UNSIGNED,
  IN p_from_date DATE,
  IN p_to_date DATE,
  OUT p_base_amount DECIMAL(12,2),
  OUT p_working_days SMALLINT,
  OUT p_present_days SMALLINT,
  OUT p_half_days SMALLINT
)
BEGIN
  DECLARE v_daily_wage DECIMAL(10,2);
  DECLARE v_half_day_wage DECIMAL(10,2);

  SELECT daily_wage, half_day_wage
  INTO v_daily_wage, v_half_day_wage
  FROM employees WHERE id = p_employee_id;

  SELECT
    COUNT(*) AS working_days,
    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END),
    SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END)
  INTO p_working_days, p_present_days, p_half_days
  FROM attendance
  WHERE employee_id = p_employee_id
    AND attendance_date BETWEEN p_from_date AND p_to_date
    AND status NOT IN ('holiday','week_off');

  SET p_base_amount = (p_present_days * v_daily_wage) + (p_half_days * v_half_day_wage);
END$$
DELIMITER ;

CREATE OR REPLACE VIEW v_today_attendance_summary AS
SELECT
  COUNT(e.id)                                          AS total_employees,
  COALESCE(SUM(CASE WHEN a.status = 'present'  THEN 1 ELSE 0 END), 0) AS present_count,
  COALESCE(SUM(CASE WHEN a.status = 'absent'   THEN 1 ELSE 0 END), 0) AS absent_count,
  COALESCE(SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END), 0) AS half_day_count,
  COALESCE(SUM(CASE WHEN a.status = 'leave'    THEN 1 ELSE 0 END), 0) AS on_leave_count,
  COALESCE(SUM(CASE WHEN a.id IS NULL          THEN 1 ELSE 0 END), 0) AS not_marked_count
FROM employees e
LEFT JOIN attendance a
  ON a.employee_id = e.id AND a.attendance_date = CURDATE()
WHERE e.status = 'active';

CREATE OR REPLACE VIEW v_employee_full AS
SELECT
  e.*,
  d.name AS department_name,
  u.email AS login_email,
  u.role  AS user_role
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN users u ON u.id = e.user_id;

-- ────────────────────────────────────────────────────────────
-- DEFAULT ADMIN USER
-- Email: admin@worktrack.pro
-- Password: Use the bcrypt hash below or reset via UPDATE
-- To use password "admin123": UPDATE users SET password_hash='$2a$12$QIj0xj.9r52lTmVVVXULie4zWZ5qWJ5r6D6X.pK6K5K5K5K5K5K5K' WHERE email='admin@worktrack.pro';
-- ────────────────────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role) VALUES
('Super Admin', 'admin@worktrack.pro',
 '$2a$12$w8evPccIP68y.z1GnQNvs.mVI2z/TI7yud19QBPgDy5VTI9mNGu9C',
 'admin');

INSERT INTO departments (name, description) VALUES
('General', 'Default department'),
('Construction', 'Construction & civil work'),
('Maintenance', 'Maintenance & repair'),
('Security', 'Security & surveillance'),
('Housekeeping', 'Housekeeping & cleaning');
