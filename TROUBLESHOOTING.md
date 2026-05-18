# Fix "localhost" Connection Issues

## Problem
You're seeing error messages about localhost connection on your screen.

## Common Causes & Solutions

### 1. Backend Server Not Running
**Check if backend is running:**
```bash
# Open terminal in backend folder
cd backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://localhost:8000
✅ MySQL connected successfully
📡 Environment: development
```

**If you see errors:**
- Port 8000 already in use → Change PORT in `.env` file
- MySQL connection failed → Check database credentials in `.env`

---

### 2. Port Mismatch Issue

**Current Configuration:**
- Backend: `http://localhost:8000` (from `.env` PORT=8000)
- Frontend: `http://localhost:3000`
- API calls: `http://localhost:8000/api`

**Fix if using different port:**

If your backend is running on port **5000** instead of **8000**:

**Option A: Update Frontend .env**
```env
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

**Option B: Update Backend .env**
```env
# backend/.env
PORT=8000
```

Then restart both servers.

---

### 3. CORS Error (Cross-Origin)

**Symptoms:**
- Error message mentions "CORS policy"
- "Access-Control-Allow-Origin" error
- Network tab shows failed requests

**Fix:**
Backend `server.js` already has CORS configured for localhost:3000. If you're using a different port:

```javascript
// backend/server.js - already configured
const allowedOrigins = [
  'http://localhost:3000',  // ✅ Already included
  'http://127.0.0.1:3000',  // ✅ Already included
];
```

---

### 4. Database Connection Error

**Symptoms:**
- "MySQL connection failed" in backend console
- 500 errors on API calls

**Fix:**
```bash
# Check MySQL is running
mysql -u root -p

# If password is wrong, update backend/.env
DB_PASSWORD=your_actual_password
```

---

### 5. Token/Authentication Error

**Symptoms:**
- Redirected to login page
- "No token provided" or "Invalid token"

**Fix:**
```javascript
// Clear browser storage and login again
localStorage.clear();
// Then refresh page and login
```

---

## Step-by-Step Troubleshooting

### Step 1: Check Backend Status
```bash
cd backend
npm run dev
```
**Expected output:**
```
🚀 Server running on http://localhost:8000
✅ MySQL connected successfully
```

### Step 2: Check Frontend Status
```bash
cd frontend
npm start
```
**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 3: Test API Connection
Open browser and visit:
```
http://localhost:8000/api/health
```
**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Go to Network tab
5. Refresh page
6. Check if API calls are failing

---

## Quick Fix Commands

### Restart Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start

# Terminal 3 - Database (if needed)
mysql.server start  # Mac
net start MySQL80   # Windows
```

### Clear Cache & Restart
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## Environment File Check

### Backend `.env` should have:
```env
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=worktrack_pro
JWT_SECRET=supersecret_jwt_key_2026_!xYz1234567890
CLIENT_URL=http://localhost:3000
```

### Frontend `.env` should have:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Still Having Issues?

### Check Firewall
- Windows: Allow Node.js through firewall
- Antivirus: Whitelist localhost ports 3000 and 8000

### Check Hosts File
```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

# Should contain:
127.0.0.1 localhost
```

### Use Different Port
If port 8000 is blocked:
```env
# backend/.env
PORT=5000

# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Error Messages & Solutions

| Error Message | Solution |
|--------------|----------|
| "Network Error" | Backend not running - start with `npm run dev` |
| "CORS policy" | Check allowedOrigins in server.js |
| "ECONNREFUSED" | Wrong port or backend crashed |
| "401 Unauthorized" | Clear localStorage and login again |
| "MySQL connection failed" | Check DB credentials in .env |
| "Port already in use" | Change PORT in .env or kill process |

---

## Kill Process on Port (if needed)

### Windows
```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### Mac/Linux
```bash
lsof -ti:8000 | xargs kill -9
```

---

## Contact Info
If issue persists, provide:
1. Screenshot of error message
2. Backend console output
3. Browser console errors (F12 → Console tab)
4. Network tab showing failed requests
