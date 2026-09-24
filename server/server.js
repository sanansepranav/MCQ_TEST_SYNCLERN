// Set server timezone to UTC
process.env.TZ = 'UTC';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const codingRoutes = require('./routes/codingRoutes');

// ─────────────────────────────────────────────
//  Initialize Express
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
//  Security & Middleware
// ─────────────────────────────────────────────
// Enhanced Helmet Security Suite
app.use(
  helmet({
    // DNS Prefetch Control: Disables DNS prefetching to protect user privacy
    dnsPrefetchControl: { allow: false },
    // Frameguard: Denies framing to prevent clickjacking
    frameguard: { action: 'deny' },
    // X-Content-Type-Options: nosniff
    noSniff: true,
    // Hide Express identification
    hidePoweredBy: true,
    // HSTS: Enforces HTTPS
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Explicit DNS & Permissions Policy security headers
app.use((_req, res, next) => {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(self)');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// NoSQL Injection Protection middleware (strips keys with $ or . from inputs)
app.use((req, _res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        config.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
      ].filter(Boolean);
      
      // Allow exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow ALL Vercel preview URLs automatically
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — general API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Rate limiting — OTP endpoint (anti-abuse)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many OTP requests. Please wait a few minutes.' },
});
app.use('/api/auth/send-otp', otpLimiter);

// Rate limiting — auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Passport middleware
require('./config/passport');
app.use(require('passport').initialize());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SyncTest API is running 🚀',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/coding', codingRoutes);

// ─────────────────────────────────────────────
//  Error Handling
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Auto-seed admin user if not exists
    const User = require('./models/User');
    const adminEmails = [process.env.ADMIN_EMAIL || 'admin@digitalmicrosys.com', 'admin@synctest.com'];
    for (const email of adminEmails) {
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          name: 'SyncTest Admin',
          email,
          password: process.env.ADMIN_PASSWORD || 'Admin@12345',
          role: 'admin',
          isActive: true,
        });
        console.log(`👑  Admin account initialized: ${email}`);
      }
    }

    app.listen(config.port, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║                                                  ║');
      console.log('║   🧪  SyncTest — API Server                      ║');
      console.log(`║   🌍  Environment : ${config.nodeEnv.padEnd(28)} ║`);
      console.log(`║   🚀  Port        : ${String(config.port).padEnd(28)} ║`);
      console.log('║                                                  ║');
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌  Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
