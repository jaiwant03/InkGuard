import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { isDbConnected } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import brandProfileRoutes from './routes/brandProfileRoutes.js';
import brandRuleRoutes from './routes/brandRuleRoutes.js';
import approvedFactRoutes from './routes/approvedFactRoutes.js';
import brandAssetRoutes from './routes/brandAssetRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for secure HTTP-only cookies
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and frontendUrl
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === config.frontendUrl) {
        callback(null, true);
      } else {
        callback(new Error('CORS request blocked from origin: ' + origin));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
  })
);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// Static uploads serving
const uploadsDir = path.resolve('uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: config.nodeEnv,
    aiAvailable: Boolean(config.geminiApiKey || config.openaiApiKey),
    tagline: 'Create with confidence. Publish with consistency.',
  });
});

// Apply general API rate limiting to all business routes
app.use('/api', apiLimiter);

// API Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/brand-profile', brandProfileRoutes);
app.use('/api/brand-rules', brandRuleRoutes);
app.use('/api/approved-facts', approvedFactRoutes);
app.use('/api/brand-assets', brandAssetRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
