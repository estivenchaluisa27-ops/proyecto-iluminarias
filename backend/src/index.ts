import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { initializeApp, cert } from 'firebase-admin/app';
import luminariasRouter from './routes/luminarias.routes.js';
import usersRouter from './routes/users.routes.js';

dotenv.config();

if (process.env.SENTRY_DSN) {
  console.log('Sentry DSN found, initializing...');
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    });
    console.log('Sentry initialized successfully');
  } catch (err) {
    console.error('Sentry init failed:', err);
  }
} else {
  console.log('SENTRY_DSN not set — skipping Sentry init');
}

try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized');
  } else {
    console.warn('Firebase Admin not configured — auth middleware will fail');
  }
} catch (err) {
  console.warn('Firebase Admin init failed:', (err as Error).message);
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    sentry: !!process.env.SENTRY_DSN,
    nodeEnv: process.env.NODE_ENV,
  });
});

app.get('/api/debug/sentry-test', () => {
  throw new Error('[Sentry test] Error controlado desde backend ' + new Date().toISOString());
});

app.use('/api/luminarias', luminariasRouter);
app.use('/api/users', usersRouter);

Sentry.setupExpressErrorHandler(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
