# WorkTrack Pro - Development Guidelines

## Code Quality Standards

### File Structure & Organization
- **Modular Architecture**: Separate concerns into distinct directories (controllers, services, middleware, routes)
- **Single Responsibility**: Each file handles one specific domain (e.g., `paymentCalculator.js` only handles payment calculations)
- **Consistent Naming**: Use descriptive names that reflect file purpose (e.g., `authController.js`, `errorHandler.js`)
- **Configuration Separation**: Environment-specific settings in `.env` files, never hardcoded

### Code Formatting Patterns
- **Indentation**: 2 spaces (consistent across all files)
- **Line Length**: Keep lines concise, break long chains for readability
- **Alignment**: Align related assignments and object properties for visual clarity
  ```javascript
  // Example from server.js
  const authRoutes       = require('./routes/auth');
  const employeeRoutes   = require('./routes/employees');
  const attendanceRoutes = require('./routes/attendance');
  ```
- **Spacing**: Use blank lines to separate logical sections with comment headers
  ```javascript
  // ── Security & Middleware ──────────────────────────────────
  app.use(helmet());
  app.use(cors({ ... }));
  
  // ── API Routes ────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  ```

### Naming Conventions
- **Variables**: camelCase for all variables and functions (`safeParseFloat`, `maskString`, `baseAmount`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`PORT`, `JWT_SECRET`)
- **Files**: camelCase for JavaScript files (`paymentCalculator.js`, `errorHandler.js`)
- **Database**: snake_case for all database columns (`employee_id`, `daily_wage`, `created_at`)
- **Routes**: kebab-case for URL paths (`/api/employees`, `/api/attendance`)
- **Enums**: lowercase with underscores in database (`'daily_wage'`, `'bank_transfer'`)

### Documentation Standards
- **File Headers**: Include descriptive comments at the top of key files
  ```javascript
  // ============================================================
  // WorkTrack Pro — Express Server Entry Point
  // ============================================================
  ```
- **Section Comments**: Use visual separators for major sections
  ```javascript
  // ── Security & Middleware ──────────────────────────────────
  ```
- **Inline Comments**: Minimal inline comments; prefer self-documenting code
- **JSDoc**: Use JSDoc-style comments for configuration files
  ```javascript
  /** @type {import('tailwindcss').Config} */
  ```

## Backend Development Patterns

### Module Exports Pattern
- **CommonJS**: Use `module.exports` and `require()` throughout backend
- **Named Exports**: Export multiple functions from utility modules
  ```javascript
  exports.safeParseFloat = (value, fallback = 0) => { ... };
  exports.maskString = (value, visibleCount = 4) => { ... };
  ```
- **Single Export**: Export single middleware/service as default
  ```javascript
  module.exports = auth;  // For middleware
  ```

### Error Handling
- **Consistent Response Format**: Always return structured JSON responses
  ```javascript
  return res.status(401).json({ 
    success: false, 
    message: 'No token provided' 
  });
  ```
- **Try-Catch**: Wrap JWT verification and async operations in try-catch blocks
- **Centralized Error Handler**: Use global error handler middleware (must be last)
- **Early Returns**: Return immediately on validation failures to avoid nesting

### Authentication & Authorization
- **JWT Pattern**: Extract token from `Authorization: Bearer <token>` header
  ```javascript
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  ```
- **User Attachment**: Attach decoded user to `req.user` for downstream access
  ```javascript
  req.user = decoded;   // { id, email, role, name }
  ```
- **Role-Based Access**: Check `req.user.role` in roleCheck middleware

### Database Patterns
- **Connection Pooling**: Always use connection pool, never direct connections
  ```javascript
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  });
  ```
- **Startup Validation**: Test database connection on server startup
  ```javascript
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected successfully');
      conn.release();
    })
    .catch(err => {
      console.error('❌ MySQL connection failed:', err.message);
      process.exit(1);
    });
  ```
- **Promise-Based**: Use `mysql2/promise` for async/await support
- **Parameterized Queries**: Always use parameterized queries to prevent SQL injection
- **Timezone**: Set `timezone: '+00:00'` for UTC consistency

### Business Logic Patterns
- **Service Layer**: Extract complex calculations into service modules
  ```javascript
  // paymentCalculator.js
  exports.calculateSalary = ({ salary_type, daily_wage, attendance }) => {
    const present = attendance.filter(r => r.status === 'present').length;
    // ... calculation logic
    return { present, baseAmount, overtimeAmount, netAmount };
  };
  ```
- **Functional Approach**: Use array methods (filter, reduce, map) for data processing
  ```javascript
  const overtime = attendance.reduce((sum, record) => 
    sum + parseFloat(record.overtime_hours || 0), 0
  );
  ```
- **Safe Parsing**: Always validate and parse numeric inputs with fallbacks
  ```javascript
  exports.safeParseFloat = (value, fallback = 0) => {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };
  ```

### Middleware Chain Pattern
- **Order Matters**: Security → Parsing → Logging → Routes → Error Handler
  ```javascript
  app.use(helmet());                    // 1. Security headers
  app.use(cors({ ... }));               // 2. CORS
  app.use(express.json());              // 3. Body parsing
  app.use(morgan('dev'));               // 4. Logging
  app.use('/api/auth', authRoutes);     // 5. Routes
  app.use(errorHandler);                // 6. Error handler (LAST)
  ```

### Environment Configuration
- **Dotenv First**: Load environment variables at the top of entry files
  ```javascript
  require('dotenv').config();
  ```
- **Fallback Values**: Provide sensible defaults for all environment variables
  ```javascript
  const PORT = process.env.PORT || 8000;
  ```
- **Environment Checks**: Conditional behavior based on `NODE_ENV`
  ```javascript
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
  ```

### CORS Configuration
- **Whitelist Pattern**: Define allowed origins explicitly
  ```javascript
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  ```
- **Regex for Local Networks**: Support dynamic local network IPs
  ```javascript
  const localNetworkOrigin = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:300[0-9]$/;
  ```
- **Origin Validation**: Use callback function for dynamic origin checking
  ```javascript
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || localNetworkOrigin.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  ```

### Logging Patterns
- **Conditional Logging**: Only log in development, always log errors
  ```javascript
  exports.log = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  };
  exports.error = (...args) => {
    console.error(...args);  // Always log errors
  };
  ```
- **Morgan Integration**: Use different formats for dev vs production
  ```javascript
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  ```

## Frontend Development Patterns

### Component Architecture
- **Functional Components**: Use function components with hooks exclusively
- **Context Providers**: Wrap app with providers in specific order
  ```jsx
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  ```

### React Query Configuration
- **Global Defaults**: Configure query client at app level
  ```javascript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        staleTime: 30000,           // 30 seconds
        retry: 1,                   // Retry once on failure
        refetchOnWindowFocus: false // Don't refetch on window focus
      },
    }
  });
  ```

### Toast Notifications
- **Global Toaster**: Single Toaster component at app root
  ```jsx
  <Toaster
    position="top-right"
    toastOptions={{
      className: 'dark:bg-gray-800 dark:text-white text-sm',
      duration: 4000,
    }}
  />
  ```

### Styling Patterns
- **Tailwind Utility Classes**: Use Tailwind for all styling, avoid custom CSS
- **Dark Mode Support**: Use `dark:` prefix for dark mode variants
  ```jsx
  className="dark:bg-gray-800 dark:text-white"
  ```
- **Custom Theme Extension**: Extend Tailwind theme in config
  ```javascript
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          900: '#312e81',
        },
      },
    },
  }
  ```

### Animation Patterns
- **Custom Animations**: Define in Tailwind config, not inline
  ```javascript
  animation: {
    'fade-in':    'fadeIn 0.3s ease-in-out',
    'slide-up':   'slideUp 0.3s ease-out',
    'pulse-slow': 'pulse 3s infinite',
  },
  keyframes: {
    fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
    slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, 
               '100%': { transform: 'translateY(0)', opacity: 1 } },
  }
  ```

### Configuration Files
- **CommonJS for Configs**: Use `module.exports` for config files (PostCSS, Tailwind)
  ```javascript
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```

## Data Handling Patterns

### Financial Calculations
- **Decimal Precision**: Use `parseFloat()` for all financial values
- **Fallback to Zero**: Default to 0 for missing financial data
  ```javascript
  const overtime = attendance.reduce((sum, record) => 
    sum + parseFloat(record.overtime_hours || 0), 0
  );
  ```
- **Explicit Calculations**: Show all calculation steps clearly
  ```javascript
  const overtimeRate = parseFloat(daily_wage) / 8 * 1.5;  // 1.5x hourly rate
  const overtimeAmount = overtime * overtimeRate;
  const netAmount = baseAmount + overtimeAmount;
  ```

### Array Processing
- **Filter-Map-Reduce**: Use functional array methods for data transformation
  ```javascript
  const present = attendance.filter(r => r.status === 'present').length;
  const halfDays = attendance.filter(r => r.status === 'half_day').length;
  ```
- **Chaining**: Chain array methods for complex transformations
- **Immutability**: Never mutate original arrays, always return new ones

### Data Masking
- **Sensitive Data**: Mask sensitive information (account numbers, Aadhaar)
  ```javascript
  exports.maskString = (value, visibleCount = 4) => {
    if (!value) return value;
    return value.replace(new RegExp(`.(?=.{${visibleCount}}$)`, 'g'), '*');
  };
  // "1234567890" → "******7890"
  ```

## API Integration Patterns

### Request/Response Format
- **Consistent Structure**: All API responses follow same format
  ```javascript
  // Success
  { success: true, data: {...}, message: "..." }
  
  // Error
  { success: false, message: "...", error: "..." }
  ```

### Status Codes
- **200**: Successful GET/PUT/PATCH
- **201**: Successful POST (resource created)
- **400**: Bad request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Internal server error

## Security Best Practices

### Password Handling
- **Never Log Passwords**: Never log or expose password fields
- **Bcrypt Hashing**: Use bcrypt for password hashing with appropriate salt rounds
- **Password Reset**: Use time-limited tokens for password reset

### Token Management
- **JWT Expiration**: Set reasonable expiration times (7 days default)
- **Token Verification**: Always verify token signature and expiration
- **Secure Storage**: Store JWT_SECRET in environment variables

### Input Validation
- **Express Validator**: Use express-validator for request validation
- **Type Checking**: Validate data types before processing
- **SQL Injection**: Use parameterized queries exclusively

### Data Privacy
- **Mask Sensitive Data**: Mask account numbers, Aadhaar, PAN in responses
- **Role-Based Access**: Restrict data access based on user role
- **Audit Logging**: Log all sensitive operations in activity_logs table

## Testing & Debugging

### Console Logging
- **Development Only**: Use conditional logging for non-error logs
- **Emoji Indicators**: Use emojis for visual log categorization
  ```javascript
  console.log('🚀 Server running on http://localhost:${PORT}');
  console.log('✅ MySQL connected successfully');
  console.error('❌ MySQL connection failed:', err.message);
  ```

### Error Messages
- **User-Friendly**: Provide clear, actionable error messages
- **No Stack Traces**: Never expose stack traces to clients in production
- **Specific Errors**: Be specific about what went wrong

## Performance Considerations

### Database Optimization
- **Connection Pooling**: Reuse connections via pool
- **Indexes**: Use indexes on frequently queried columns
- **Limit Results**: Always paginate large result sets
- **Avoid N+1**: Use JOINs or views instead of multiple queries

### Frontend Optimization
- **React Query Caching**: Leverage staleTime for reduced API calls
- **Lazy Loading**: Use React.lazy() for code splitting (when needed)
- **Memoization**: Use useMemo/useCallback for expensive computations

## Deployment Checklist

### Environment Setup
- Set `NODE_ENV=production`
- Use strong, unique JWT_SECRET
- Configure production database credentials
- Set up HTTPS/SSL certificates
- Configure proper CORS origins
- Enable rate limiting
- Set up monitoring and logging
- Configure automated backups

### Code Quality
- Remove all console.log statements (except errors)
- Minify and bundle frontend assets
- Optimize images and static assets
- Enable compression middleware
- Set security headers via Helmet
