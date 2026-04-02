import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { generatePipeline, deployPipeline, getPipelinesForRepo } from '../services/cicd.service';

export async function generatePipelineHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { repoId } = req.params;
    const pipeline = await generatePipeline(repoId, userId);
    res.status(201).json(pipeline);
  } catch (err) {
    next(err);
  }
}

export async function deployPipelineHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { repoId, id } = req.params;
    const pipeline = await deployPipeline(id, repoId, userId);
    res.json(pipeline);
  } catch (err) {
    next(err);
  }
}

export async function listPipelines(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { repoId } = req.params;
    const pipelines = await getPipelinesForRepo(repoId);
    res.json(pipelines);
  } catch (err) {
    next(err);
  }
}
