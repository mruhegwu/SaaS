import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app';
import { config } from './config';
import { logger } from './middleware/logger';

const startServer = async (): Promise<void> => {
  const app = await createApp();

  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    logger.info(`API documentation available at http://localhost:${config.port}/api/docs`);
  });

  const gracefulShutdown = (signal: string): void => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
