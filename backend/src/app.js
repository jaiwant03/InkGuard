import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
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

// Trust reverse proxy (essential for Render / Cloudflare to correctly pass client IP and HTTPS headers)
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic origin matching supporting local development, configured FRONTEND_URL, and Vercel deployments
const configuredOrigins = (config.frontendUrl || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow mobile apps, curl, server-to-server, and health checks
  const cleanOrigin = origin.replace(/\/+$/, '');

  // Local development on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }
  // Configured frontend URLs
  if (configuredOrigins.includes(cleanOrigin)) {
    return true;
  }
  // Any Vercel deployment (production, preview branches, PR previews)
  if (/^https:\/\/[a-zA-Z0-9_\-.]+\.vercel\.app$/.test(cleanOrigin)) {
    return true;
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// Static uploads serving (ensure directory exists)
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Root welcome / status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'INKGUARD Brand Governance Platform API',
    status: 'operational',
    version: '1.0.0',
    health: '/api/health',
    tagline: 'Create with confidence. Publish with consistency.',
  });
});

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
