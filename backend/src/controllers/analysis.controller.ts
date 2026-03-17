import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { triggerAnalysis, getLatestAnalysis } from '../services/analysis.service';

export async function startAnalysis(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { repoId } = req.params;
    const analysis = await triggerAnalysis(repoId, userId);
    res.status(202).json(analysis);
  } catch (err) {
    next(err);
  }
}

export async function getAnalysis(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { repoId } = req.params;
    const analysis = await getLatestAnalysis(repoId);
    if (!analysis) {
      res.status(404).json({ error: 'No analysis found for this repository' });
      return;
    }
    res.json(analysis);
  } catch (err) {
    next(err);
  }
}
