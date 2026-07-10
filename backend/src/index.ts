import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { initializeApp, cert } from 'firebase-admin/app';
import luminariasRouter from './routes/luminarias.routes.js';
import usersRouter from './routes/users.routes.js';

dotenv.config();

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
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api/luminarias', luminariasRouter);
app.use('/api/users', usersRouter);

const analyticsTarget = process.env.ANALYTICS_URL || 'http://localhost:5000';
app.use('/analytics', createProxyMiddleware({
  target: analyticsTarget,
  changeOrigin: true,
}));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
