import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, isConnected } from './server/config/db.js';
import { syncQuestionUsageFromExams } from './server/services/questionSelectionService.js';
import authRoutes from './server/routes/authRoutes.js';
import studentRoutes from './server/routes/studentRoutes.js';
import examRoutes from './server/routes/examRoutes.js';
import questionRoutes from './server/routes/questionRoutes.js';
import submissionRoutes from './server/routes/submissionRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import settingRoutes from './server/routes/settingRoutes.js';
import analyticsRoutes from './server/routes/analyticsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  // 1. Connect to MongoDB Atlas (fails startup safely if connection fails or MONGODB_URI is missing)
  await connectDB();
  // Sync legacy question usage in background
  syncQuestionUsageFromExams().catch((e) => console.warn('[Sync Error]', e.message));

  const app = express();

  // 2. Global Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin: '*',
      credentials: true
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. Health Check Endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = isConnected() ? 'connected' : 'disconnected';
    if (!isConnected()) {
      return res.status(503).json({
        status: 'error',
        database: dbStatus,
        message: 'Database is not connected.'
      });
    }
    return res.status(200).json({
      status: 'ok',
      database: dbStatus,
      platform: 'Online MCQ Exam Platform',
      timestamp: new Date().toISOString()
    });
  });

  // 4. API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/exams', examRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/admins', adminRoutes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // 5. Unmatched API route handler (prevent returning HTML index.html for API requests)
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // 6. Central Error Handler for API
  app.use('/api', (err, req, res, next) => {
    console.error('[API Error]:', err.stack || err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // 6. Frontend Serving / Vite Dev Middleware
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (viteError) {
      console.warn('[Vite Middleware] Warning:', viteError.message);
    }
  }

  // 7. General Central Error Handler
  app.use((err, req, res, next) => {
    console.error('[Server Error]:', err.stack || err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // 8. Start Listening
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Online Exam Platform Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Fatal Error] Failed to start server:', err.message);
  process.exit(1);
});
