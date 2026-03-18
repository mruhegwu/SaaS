import { Request, Response } from 'express';

/**
 * @openapi
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         timestamp:
 *           type: string
 *         uptime:
 *           type: number
 *         version:
 *           type: string
 */

export const getHealth = (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
};

export const getLiveness = (_req: Request, res: Response): void => {
  res.status(200).send('OK');
};
