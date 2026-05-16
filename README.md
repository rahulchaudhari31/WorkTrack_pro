# WorkTrack Pro 🏗️

> Professional Attendance & Payment Management System

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, JWT
- **Database**: MySQL 8.0+

## Quick Start
```bash
# Database
mysql -u root -p < database/schema.sql
mysql -u root -p worktrack_pro < database/seed.sql

# Backend
cd backend && cp .env.example .env
npm install && npm run dev

# Frontend
cd frontend && npm install && npm start
```

## Default Login
- **URL**: http://localhost:3000
- **Email**: admin@worktrack.pro
- **Password**: Admin@123

## Key Features
✅ JWT Authentication with role-based access (Admin / Manager / Employee)
✅ Daily attendance marking with bulk update support
✅ Automatic salary calculation based on attendance
✅ Payment distribution with receipt generation
✅ Interactive dashboard with Recharts visualizations
✅ Dark mode support
✅ Mobile responsive

## API
Base URL: `http://localhost:5000/api`

## Roles
| Feature              | Admin | Manager | Employee |
|---------------------|-------|---------|----------|
| View dashboard       | ✅    | ✅      | ✅       |
| Manage employees     | ✅    | ✅      | ❌       |
| Mark attendance      | ✅    | ✅      | ❌       |
| Create payments      | ✅    | ✅      | ❌       |
| Delete employees     | ✅    | ❌      | ❌       |
| View own records     | ✅    | ✅      | ✅       |

## Database Schema
- `users` — system login accounts
- `employees` — worker/staff records
- `departments` — organizational units
- `attendance` — daily attendance log
- `payments` — payment distribution records
- `advances` — salary advances
- `leaves` — leave requests
- `holidays` — company holidays
- `activity_logs` — audit trail
- `notifications` — in-app notifications
