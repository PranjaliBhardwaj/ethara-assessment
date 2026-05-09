const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
// Load server/.env when started from repo root (`npm start`) or from server/
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim() === '') {
  console.error(
    '\n❌ JWT_SECRET is missing. Set it in Railway Variables (or server/.env locally).\n' +
      '   Login and signup will fail until this is set — jsonwebtoken cannot sign without a secret.\n'
  );
  process.exit(1);
}

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskStandaloneRoutes = require('./routes/taskStandaloneRoutes');

// Initialize Express app
const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
// Reflect the request Origin (works for Vite + API on different ports and for Railway monoliths).
// Optional: restrict with CLIENT_URL in custom middleware if you expose the API to untrusted origins.
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskStandaloneRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── Static Files (deployed bundle: client/dist) ───────────
// Serve the SPA whenever the Vite build exists. Relying only on NODE_ENV
// breaks on hosts (e.g. Railway) that do not set NODE_ENV=production at runtime.
const distPath = path.join(__dirname, '..', 'client', 'dist');
const clientIndex = path.join(distPath, 'index.html');
if (fs.existsSync(clientIndex)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(clientIndex);
  });
}

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const host = process.env.HOST ?? '0.0.0.0';
    app.listen(PORT, host, () => {
      console.log(`\n🚀 TaskFlow Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
