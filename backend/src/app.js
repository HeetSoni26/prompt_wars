/**
 * @fileoverview CareerPilot Express application entry point.
 * Configures middleware, mounts routes, and starts the server.
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const chatRoutes = require('./routes/chat');
const memoryRoutes = require('./routes/memory');
const insightRoutes = require('./routes/insights');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * GET /health — Cloud Run health check endpoint.
 * Returns 200 with service status and version.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'careerpilot-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/insights', insightRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Start ─────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    process.stdout.write(`[CareerPilot] Server running on port ${PORT} (${env})\n`);
  });
}

module.exports = app;
