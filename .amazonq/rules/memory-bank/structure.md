# WorkTrack Pro - Project Structure

## Architecture Overview
WorkTrack Pro follows a **three-tier architecture** with clear separation between presentation (React frontend), business logic (Express backend), and data persistence (MySQL database). The system uses JWT for stateless authentication and RESTful API design for client-server communication.

## Directory Structure

```
Employee Attendance/
├── backend/                    # Node.js/Express API server
│   ├── config/                 # Configuration files
│   │   └── db.js              # MySQL connection pool setup
│   ├── controllers/            # Request handlers & business logic
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── employeeController.js
│   │   └── paymentController.js
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT verification
│   │   ├── errorHandler.js    # Global error handling
│   │   └── roleCheck.js       # Role-based authorization
│   ├── routes/                 # API route definitions
│   │   ├── attendance.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── employees.js
│   │   └── payments.js
│   ├── services/               # Business logic services
│   │   ├── emailService.js    # Email notifications
│   │   └── paymentCalculator.js # Salary computation
│   ├── utils/                  # Utility functions
│   │   ├── helpers.js         # Common helper functions
│   │   └── logger.js          # Logging utility
│   ├── uploads/                # File upload storage
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json            # Backend dependencies
│   └── server.js               # Application entry point
│
├── frontend/                   # React.js client application
│   ├── public/                 # Static assets
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── attendance/    # Attendance-specific components
│   │   │   ├── common/        # Shared UI components
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── employees/     # Employee management components
│   │   │   └── payments/      # Payment-related components
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── ThemeContext.jsx   # Theme (dark/light mode)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layout components
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/              # Route-level page components
│   │   │   ├── auth/          # Login/Register pages
│   │   │   ├── Attendance.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Reports.jsx
│   │   ├── routes/             # Routing configuration
│   │   │   └── AppRoutes.jsx
│   │   ├── services/           # API client services
│   │   │   └── api.js         # Axios HTTP client
│   │   ├── App.jsx             # Root component
│   │   ├── index.css           # Global styles
│   │   └── index.js            # Application entry point
│   ├── package.json            # Frontend dependencies
│   ├── postcss.config.js       # PostCSS configuration
│   └── tailwind.config.js      # Tailwind CSS configuration
│
├── database/                   # Database schema & seed data
│   ├── schema.sql             # Complete database structure
│   └── seed.sql               # Initial data population
│
├── .amazonq/                   # Amazon Q configuration
│   └── rules/
│       └── memory-bank/       # Project documentation
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

## Core Components & Relationships

### Backend Architecture

**Controllers** → Handle HTTP requests, validate input, orchestrate services
- `authController.js`: Login, registration, password reset
- `employeeController.js`: CRUD operations for employees
- `attendanceController.js`: Attendance marking, bulk updates, reports
- `paymentController.js`: Payment creation, approval, receipt generation
- `dashboardController.js`: Aggregated statistics and analytics

**Middleware** → Request processing pipeline
- `auth.js`: Verifies JWT tokens, attaches user to request
- `roleCheck.js`: Enforces role-based permissions (admin/manager/employee)
- `errorHandler.js`: Centralized error response formatting

**Services** → Business logic layer
- `paymentCalculator.js`: Computes salaries based on attendance, overtime, deductions
- `emailService.js`: Sends notifications via Nodemailer

**Routes** → API endpoint definitions
- Maps HTTP methods to controller functions
- Applies middleware for authentication and authorization

### Frontend Architecture

**Context Providers** → Global state management
- `AuthContext`: User authentication state, login/logout functions
- `ThemeContext`: Dark/light mode toggle and persistence

**Pages** → Route-level components
- Each page corresponds to a major feature (Dashboard, Employees, Attendance, Payments)
- Composed of smaller components from `components/` directory

**Components** → Reusable UI elements
- Feature-specific components organized by domain (attendance, employees, payments)
- Common components (buttons, modals, tables) in `common/` directory
- Dashboard widgets (charts, cards) in `dashboard/` directory

**Services** → API communication
- `api.js`: Axios instance with interceptors for authentication headers and error handling

**Layouts** → Page structure templates
- `DashboardLayout.jsx`: Sidebar navigation, header, content area wrapper

### Database Schema

**Core Tables**:
- `users`: System login accounts with role-based access
- `employees`: Worker/staff records with personal and employment details
- `departments`: Organizational units
- `attendance`: Daily attendance log with status tracking
- `payments`: Payment distribution records with calculation details
- `advances`: Salary advance tracking
- `leaves`: Leave request management
- `holidays`: Company holiday calendar
- `activity_logs`: Audit trail for all system actions
- `notifications`: In-app notification system

**Relationships**:
- `employees.user_id` → `users.id` (optional login account)
- `employees.department_id` → `departments.id`
- `attendance.employee_id` → `employees.id` (cascade delete)
- `payments.employee_id` → `employees.id` (restrict delete)
- `leaves.employee_id` → `employees.id` (cascade delete)

**Views**:
- `v_today_attendance_summary`: Real-time attendance statistics
- `v_employee_full`: Joined employee data with department and user info

**Stored Procedures**:
- `sp_calculate_payment`: Automated salary calculation based on attendance

## Architectural Patterns

### Backend Patterns
- **MVC Pattern**: Controllers handle requests, models (implicit via SQL), views (JSON responses)
- **Middleware Chain**: Authentication → Authorization → Controller → Error Handler
- **Service Layer**: Business logic separated from controllers for reusability
- **Connection Pooling**: MySQL2 connection pool for efficient database access
- **JWT Stateless Auth**: No server-side session storage, token-based authentication

### Frontend Patterns
- **Component Composition**: Small, reusable components composed into pages
- **Context API**: Global state management without prop drilling
- **Custom Hooks**: Reusable logic extraction (likely in `hooks/` directory)
- **Protected Routes**: Authentication-based route access control
- **API Abstraction**: Centralized HTTP client with interceptors

### Data Flow
1. User interacts with React component
2. Component calls API service function
3. Axios sends HTTP request with JWT token
4. Backend middleware verifies token and role
5. Controller processes request, calls service if needed
6. Service executes business logic, queries database
7. Response flows back through middleware to frontend
8. Component updates state and re-renders UI

## Technology Integration

- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first styling with custom configuration
- **Framer Motion**: Animation library for smooth transitions
- **Recharts**: Data visualization for dashboard analytics
- **React Query**: Server state management and caching (configured in frontend)
- **Express Validator**: Request validation middleware
- **Helmet**: Security headers for Express
- **Morgan**: HTTP request logging
- **Multer**: File upload handling
- **Bcrypt**: Password hashing
- **UUID**: Unique identifier generation
