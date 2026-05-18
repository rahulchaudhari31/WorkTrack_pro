# WorkTrack Pro - Technology Stack

## Programming Languages
- **JavaScript (ES6+)**: Primary language for both frontend and backend
- **SQL**: Database queries and stored procedures
- **JSX**: React component syntax
- **CSS**: Styling via Tailwind utility classes

## Backend Stack

### Runtime & Framework
- **Node.js**: JavaScript runtime environment
- **Express.js 4.19.2**: Web application framework
- **Version**: Backend v1.0.0 (worktrack-pro-backend)

### Core Dependencies
- **mysql2 ^3.9.7**: MySQL database driver with promise support
- **jsonwebtoken ^9.0.2**: JWT token generation and verification
- **bcryptjs ^2.4.3**: Password hashing and comparison
- **dotenv ^16.4.5**: Environment variable management
- **cors ^2.8.5**: Cross-Origin Resource Sharing middleware
- **helmet ^7.1.0**: Security headers middleware
- **morgan ^1.10.0**: HTTP request logger
- **express-validator ^7.1.0**: Request validation middleware
- **multer ^1.4.5-lts.1**: Multipart/form-data file upload handling
- **nodemailer ^6.9.13**: Email sending service
- **uuid ^9.0.1**: Unique identifier generation

### Development Dependencies
- **nodemon ^3.1.0**: Auto-restart server on file changes

### Backend Commands
```bash
npm start          # Production mode (node server.js)
npm run dev        # Development mode with auto-reload (nodemon)
```

## Frontend Stack

### Framework & Libraries
- **React 18.3.1**: UI library with hooks and functional components
- **React DOM 18.3.1**: React renderer for web
- **Version**: Frontend v1.0.0 (worktrack-pro-frontend)

### Core Dependencies
- **react-router-dom ^6.18.0**: Client-side routing
- **axios ^1.6.5**: HTTP client for API requests
- **react-query ^3.39.3**: Server state management and caching
- **framer-motion ^11.0.0**: Animation library
- **recharts ^2.9.0**: Chart library for data visualization
- **lucide-react ^0.499.0**: Icon library
- **react-hot-toast ^2.4.0**: Toast notification system
- **date-fns ^2.30.0**: Date manipulation and formatting
- **@headlessui/react ^2.2.10**: Unstyled accessible UI components

### Styling
- **tailwindcss ^3.4.4**: Utility-first CSS framework
- **postcss ^8.4.35**: CSS transformation tool
- **autoprefixer ^10.4.19**: PostCSS plugin for vendor prefixes

### Build Tools
- **react-scripts ^5.0.1**: Create React App build configuration

### Frontend Commands
```bash
npm start          # Development server (http://localhost:3000)
npm run build      # Production build
npm test           # Run tests
npm run eject      # Eject from Create React App (irreversible)
```

### Browser Support
**Production**:
- >0.2% market share
- Not dead browsers
- Not Opera Mini

**Development**:
- Latest Chrome version
- Latest Firefox version
- Latest Safari version

## Database

### Database Management System
- **MySQL 8.0+**: Relational database
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Storage Engine**: InnoDB

### Database Features Used
- Foreign key constraints with CASCADE/RESTRICT/SET NULL
- Indexes for query optimization
- ENUM types for status fields
- Stored procedures (sp_calculate_payment)
- Views (v_today_attendance_summary, v_employee_full)
- Triggers (implicit via ON UPDATE CURRENT_TIMESTAMP)
- AUTO_INCREMENT primary keys
- DECIMAL types for financial calculations

### Database Commands
```bash
# Create database and schema
mysql -u root -p < database/schema.sql

# Populate seed data
mysql -u root -p worktrack_pro < database/seed.sql
```

## Development Environment

### Environment Variables

**Backend (.env)**:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=worktrack_pro
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend (.env)**:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Project Setup

**Prerequisites**:
- Node.js (v14+ recommended)
- MySQL 8.0+
- npm or yarn package manager

**Installation Steps**:
1. Database setup:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p worktrack_pro < database/seed.sql
   ```

2. Backend setup:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

3. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Default Access
- **Frontend URL**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Default Admin**:
  - Email: admin@worktrack.pro
  - Password: Admin@123

## API Architecture

### Base URL
```
http://localhost:5000/api
```

### Authentication
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 7 days (configurable)

### API Endpoints Structure
- `/api/auth/*` - Authentication endpoints
- `/api/employees/*` - Employee management
- `/api/attendance/*` - Attendance tracking
- `/api/payments/*` - Payment processing
- `/api/dashboard/*` - Dashboard statistics

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Security Features

### Backend Security
- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configured for specific origins
- **JWT**: Stateless authentication with expiration
- **Bcrypt**: Password hashing with salt rounds
- **Express Validator**: Input sanitization and validation
- **SQL Injection Prevention**: Parameterized queries via mysql2

### Frontend Security
- **Token Storage**: Secure storage in localStorage/sessionStorage
- **Protected Routes**: Authentication-required route guards
- **Role-Based UI**: Conditional rendering based on user role
- **XSS Prevention**: React's built-in escaping

## Performance Optimizations

### Backend
- **Connection Pooling**: MySQL2 connection pool for efficient database access
- **Async/Await**: Non-blocking I/O operations
- **Indexing**: Database indexes on frequently queried columns

### Frontend
- **React Query**: Automatic caching and background refetching
- **Code Splitting**: React Router lazy loading (potential)
- **Production Build**: Minification and optimization via react-scripts

## Development Tools

### Logging
- **Morgan**: HTTP request logging in development
- **Custom Logger**: Utility logger in `backend/utils/logger.js`

### File Uploads
- **Multer**: Handles multipart/form-data
- **Storage**: Local filesystem in `backend/uploads/`

### Email Notifications
- **Nodemailer**: SMTP-based email sending
- **Templates**: HTML email templates (in emailService.js)

## Deployment Considerations

### Production Checklist
- Set `NODE_ENV=production`
- Use strong JWT_SECRET
- Configure production database credentials
- Enable HTTPS
- Set up proper CORS origins
- Configure email service credentials
- Set up file upload storage (consider cloud storage)
- Enable database backups
- Configure logging and monitoring
- Optimize database indexes
- Set up reverse proxy (nginx/Apache)
