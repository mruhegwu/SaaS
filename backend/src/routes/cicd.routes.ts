import { Router } from 'express';
import { generatePipelineHandler, deployPipelineHandler, listPipelines } from '../controllers/cicd.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const cicdRoutes = Router();

cicdRoutes.use(authMiddleware);
cicdRoutes.post('/:repoId/generate', generatePipelineHandler);
cicdRoutes.post('/:repoId/:id/deploy', deployPipelineHandler);
cicdRoutes.get('/:repoId', listPipelines);
