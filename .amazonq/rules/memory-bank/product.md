# WorkTrack Pro - Product Overview

## Purpose
WorkTrack Pro is a comprehensive attendance and payment management system designed for organizations managing daily wage workers, contractors, and permanent employees. It streamlines workforce tracking, automates salary calculations, and provides real-time insights into attendance patterns and payment distributions.

## Value Proposition
- **Automated Salary Calculation**: Eliminates manual calculation errors by automatically computing wages based on attendance records, overtime hours, and worker categories
- **Role-Based Access Control**: Three-tier permission system (Admin/Manager/Employee) ensures data security and appropriate access levels
- **Real-Time Monitoring**: Live dashboard with attendance summaries, payment tracking, and workforce analytics
- **Flexible Payment Management**: Supports multiple payment methods (cash, bank transfer, UPI, cheque) with advance deduction tracking
- **Audit Trail**: Complete activity logging and notification system for compliance and transparency

## Key Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin, Manager, Employee)
- Password reset with token expiration
- Session management with last login tracking

### Employee Management
- Comprehensive employee profiles with personal, banking, and employment details
- Support for multiple worker categories (permanent, contract, daily wage, intern)
- Department-based organization
- Document management (Aadhaar, PAN, profile photos)
- Employee status tracking (active, inactive, on leave, terminated)

### Attendance Tracking
- Daily attendance marking with multiple status types (present, absent, half-day, leave, holiday, week_off)
- Bulk attendance update support
- Time-in/time-out recording
- Overtime and late arrival tracking
- Leave management system with approval workflow
- Holiday calendar management

### Payment Processing
- Automatic salary calculation based on attendance records
- Support for daily, weekly, and monthly payment cycles
- Overtime calculation with configurable rates
- Bonus and deduction management
- Advance salary tracking with automatic deduction
- Payment receipt generation
- Multiple payment status tracking (pending, paid, failed, cancelled)

### Dashboard & Analytics
- Real-time attendance summary with visual charts (Recharts)
- Payment distribution analytics
- Department-wise workforce breakdown
- Trend analysis for attendance patterns
- Quick action cards for common tasks

### Additional Capabilities
- Dark mode support with theme persistence
- Mobile-responsive design
- Activity logging for audit trails
- In-app notification system
- Email notifications (via Nodemailer)
- File upload support (Multer)
- Data export capabilities

## Target Users

### Administrators
- Full system access and control
- Employee lifecycle management (create, update, delete)
- Payment approval and distribution
- System configuration and user management
- Access to all reports and analytics

### Managers
- Department-level employee management
- Attendance marking and approval
- Payment processing and distribution
- View reports for assigned departments
- Cannot delete employees (read/update only)

### Employees
- View personal attendance records
- Check payment history
- Update personal profile information
- View leave balance and history
- Limited dashboard access (own records only)

## Use Cases

1. **Construction Companies**: Track daily wage workers across multiple sites with varying pay rates
2. **Manufacturing Units**: Manage shift-based attendance with overtime calculations
3. **Service Organizations**: Handle mixed workforce (permanent + contract) with different payment cycles
4. **Small-Medium Enterprises**: Centralized attendance and payroll management without complex ERP systems
5. **Facility Management**: Track housekeeping, security, and maintenance staff with department-wise reporting
