import { Router } from 'express';
import { getHealth, getLiveness } from '../controllers/health.controller';

export const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Get application health status
 *     responses:
 *       200:
 *         description: Application is healthy
 */
healthRouter.get('/', getHealth);
healthRouter.get('/live', getLiveness);
