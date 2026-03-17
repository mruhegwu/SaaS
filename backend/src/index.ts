import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { AppDataSource } from './database/connection';
import { authRoutes } from './routes/auth.routes';
import { repoRoutes } from './routes/repo.routes';
import { analysisRoutes } from './routes/analysis.routes';
import { cicdRoutes } from './routes/cicd.routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { apiRateLimiter } from './middleware/rateLimit.middleware';

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(apiRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/cicd', cicdRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

export default app;
