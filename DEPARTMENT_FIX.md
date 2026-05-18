# Department Visibility Fix

## Problem
Departments were not visible in the dashboard "Salary by Department" chart, and payment tables weren't showing department information.

## Root Causes
1. Dashboard query only showed departments with existing payment records
2. Payment queries didn't include department information
3. Departments table might be missing data

## Solutions Applied

### 1. Backend API Updates

#### Updated `dashboardController.js`
- **`getSalaryByDept()`**: Now shows ALL departments (even with zero payments)
  - Added `employee_count` field
  - Filters only active employees
  - Orders by total DESC, then by name
  
- **New `getDepartmentStats()`**: Comprehensive department statistics
  - Total/active/inactive employee counts
  - Total/paid/pending payment amounts
  - Available at: `GET /api/dashboard/department-stats`

#### Updated `paymentController.js`
- **`getPayments()`**: Now includes department information
  - Added `department_id` and `department_name` to response
  - Added `department_id` filter support in query params
  - Example: `GET /api/payments?department_id=2`

### 2. Database Fix Script

Created `database/fix_departments.sql` to:
- Ensure all 5 departments exist (General, Construction, Maintenance, Security, Housekeeping)
- Verify employee-department relationships
- Show current department statistics

## How to Apply the Fix

### Step 1: Run Database Fix (Optional - if departments are missing)
```bash
mysql -u root -p worktrack_pro < database/fix_departments.sql
```

### Step 2: Restart Backend Server
```bash
cd backend
npm run dev
```

### Step 3: Verify in Frontend
1. Open dashboard at http://localhost:3000
2. Check "Salary by Department" chart - should show all departments
3. Go to Payments page - should show department column
4. Filter payments by department

## API Endpoints Updated

### Dashboard Endpoints
```
GET /api/dashboard/salary-by-dept
Response: [
  {
    department: "Construction",
    department_id: 2,
    employee_count: 3,
    total: 12350.00,
    paid: 8975.00,
    pending: 3375.00,
    daily: 0,
    weekly: 12350.00,
    monthly: 0,
    advance: 0,
    bonus: 0,
    deduction: 0
  },
  ...
]

GET /api/dashboard/department-stats (NEW)
Response: [
  {
    id: 2,
    department: "Construction",
    description: "Construction & civil work",
    total_employees: 3,
    active_employees: 3,
    inactive_employees: 0,
    total_payments: 12350.00,
    paid_amount: 8975.00,
    pending_amount: 3375.00
  },
  ...
]
```

### Payment Endpoints
```
GET /api/payments?department_id=2
Response: {
  success: true,
  data: [
    {
      id: 1,
      payment_code: "PAY-20240601-0001",
      employee_id: 1,
      full_name: "Rajesh Kumar",
      employee_code: "EMP-0001",
      department_id: 2,
      department_name: "Construction",
      net_amount: 3575.00,
      payment_status: "paid",
      ...
    }
  ],
  pagination: { ... }
}
```

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] "Salary by Department" chart shows all 5 departments
- [ ] Departments with no payments show ₹0
- [ ] Payment list shows department column
- [ ] Can filter payments by department
- [ ] Employee list shows department names
- [ ] Creating new payment includes department info

## Database Schema Verification

Run this query to verify departments are properly set up:
```sql
SELECT 
  d.id,
  d.name,
  COUNT(DISTINCT e.id) AS employees,
  COUNT(DISTINCT p.id) AS payments,
  COALESCE(SUM(p.net_amount), 0) AS total_amount
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
LEFT JOIN payments p ON p.employee_id = e.id
GROUP BY d.id, d.name
ORDER BY d.id;
```

Expected output:
```
+----+--------------+-----------+----------+--------------+
| id | name         | employees | payments | total_amount |
+----+--------------+-----------+----------+--------------+
|  1 | General      |         0 |        0 |         0.00 |
|  2 | Construction |         3 |        2 |      8975.00 |
|  3 | Maintenance  |         1 |        1 |      3375.00 |
|  4 | Security     |         1 |        0 |         0.00 |
|  5 | Housekeeping |         1 |        0 |         0.00 |
+----+--------------+-----------+----------+--------------+
```

## Notes

- All departments now appear in dashboard even with zero payments
- Payment filtering by department is now supported
- Department statistics endpoint provides comprehensive data
- No frontend changes required - existing components will automatically use new data
