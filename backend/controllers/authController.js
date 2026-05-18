const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const db     = require('../config/db');

// ── Helper: generate JWT ──────────────────────────────────
const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });
  } catch (err) { next(err); }
};

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
      [name, email, hash, role]
    );
    const [newUser] = await db.execute('SELECT id,name,email,role FROM users WHERE id=?', [result.insertId]);
    const token = generateToken(newUser[0]);

    res.status(201).json({ success: true, token, user: newUser[0] });
  } catch (err) { next(err); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await db.execute('SELECT id FROM users WHERE email=?', [email]);
    if (!rows.length) {
      return res.json({ success: true, message: 'If that email exists, a reset link was sent' });
    }

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.execute(
      'UPDATE users SET reset_token=?, reset_token_expires=? WHERE id=?',
      [token, expires, rows[0].id]
    );

    console.log(`🔑 Password reset token for ${email}: ${token}`);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE reset_token=? AND reset_token_expires > NOW()',
      [token]
    );
    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const hash = await bcrypt.hash(password, 12);
    await db.execute(
      'UPDATE users SET password_hash=?, reset_token=NULL, reset_token_expires=NULL WHERE id=?',
      [hash, rows[0].id]
    );
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id,name,email,role,avatar_url,last_login,created_at FROM users WHERE id=?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
};
