import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/auth.routes';
import auditLogRoutes from './routes/audit-log.routes';
import categoryRoutes from './routes/category.routes';
import eventRoutes from './routes/event.routes';
import homeContentRoutes from './routes/home-content.routes';
import inquiryRoutes from './routes/inquiry.routes';
import leadContentRoutes from './routes/lead-content.routes';
import lecturerRoutes from './routes/lecturer.routes';
import mediaRoutes from './routes/media.routes';
import newsRoutes from './routes/news.routes';
import pageRoutes from './routes/page.routes';
import programRoutes from './routes/program.routes';
import roleRoutes from './routes/role.routes';
import siteSettingsRoutes from './routes/site-settings.routes';
import tagRoutes from './routes/tag.routes';
import userRoutes from './routes/user.routes';
import { HttpError } from './utils/http-error';

const app: Express = express();
const port = process.env.PORT || 3000;

const envOrigins = [process.env.FRONTEND_URLS, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  'http://localhost:5173',
  'http://localhost:3002',
  ...envOrigins,
]));

if (process.env.NODE_ENV !== 'production') {
  app.set('json spaces', 2);
}

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-side tools and same-origin requests without Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || './uploads')));

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'STTB API is running', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'STTB API is running. Use /api/* endpoints.',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      news: '/api/news',
      programs: '/api/programs',
    },
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/home-content', homeContentRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/lead-content', leadContentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/pages', pageRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err instanceof HttpError ? err.message : 'Internal Server Error';
  const details = err instanceof HttpError ? err.details : undefined;

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details !== undefined && { details }),
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
