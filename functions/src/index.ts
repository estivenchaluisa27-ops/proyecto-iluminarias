import * as functions from 'firebase-functions/v1';
import express from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import luminariasRouter from './routes/luminarias.routes.js';
import usersRouter from './routes/users.routes.js';

const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV ?? 'production',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  });
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
  } else {
    initializeApp({ credential: applicationDefault() });
  }
} catch {
  initializeApp({ credential: applicationDefault() });
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/luminarias', luminariasRouter);
app.use('/api/users', usersRouter);

Sentry.setupExpressErrorHandler(app);

export const api = functions.https.onRequest(app);
