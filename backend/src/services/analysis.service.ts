import { AppDataSource } from '../config/database';
import { Analysis } from '../models/Analysis';
import { Repository } from '../models/Repository';
import { aiService } from './ai.service';
import { githubService } from './github.service';
import { logger } from '../config/logger';

export class AnalysisService {
  async runAnalysis(repositoryId: string, accessToken: string): Promise<Analysis> {
    const repoRepo = AppDataSource.getRepository(Repository);
    const analysisRepo = AppDataSource.getRepository(Analysis);

    const repo = await repoRepo.findOne({ where: { id: repositoryId } });
    if (!repo) throw new Error('Repository not found');

    const analysis = analysisRepo.create({ repository: repo, status: 'running' });
    await analysisRepo.save(analysis);

    this.performAnalysis(analysis, repo, accessToken).catch((err) => logger.error('Analysis failed:', err));
    return analysis;
  }

  private async performAnalysis(analysis: Analysis, repo: Repository, accessToken: string): Promise<void> {
    const analysisRepo = AppDataSource.getRepository(Analysis);
    const repoRepo = AppDataSource.getRepository(Repository);

    try {
      const [owner, repoName] = repo.fullName.split('/');
      const contents = await githubService.getRepoContents(accessToken, owner, repoName);
      const items = contents as Array<{ name: string; type: string; path: string }>;
      const fileStructure = items.map((i) => `${i.type === 'dir' ? '📁' : '📄'} ${i.name}`).join('\n');

      const codeExtensions = ['.ts', '.js', '.py', '.java', '.go', '.rs'];
      const codeFiles = items.filter((f) => f.type === 'file' && codeExtensions.some((e) => f.name.endsWith(e))).slice(0, 3);
      const samples: string[] = [];
      for (const file of codeFiles) {
        const content = await githubService.getFileContent(accessToken, owner, repoName, file.path);
        if (content) samples.push(`// ${file.path}\n${content.slice(0, 500)}`);
      }

      const result = await aiService.analyzeRepository(repo.fullName, repo.language ?? null, fileStructure, samples.join('\n\n---\n\n'));

      analysis.summary = result.summary;
      analysis.codeQuality = result.codeQuality as unknown as Record<string, unknown>;
      analysis.securityIssues = result.securityIssues as unknown as Record<string, unknown>;
      analysis.improvements = result.improvements as unknown as Record<string, unknown>;
      analysis.overallScore = result.overallScore;
      analysis.status = 'completed';
      await analysisRepo.save(analysis);

      repo.healthScore = result.overallScore;
      await repoRepo.save(repo);
    } catch (error) {
      analysis.status = 'failed';
      await analysisRepo.save(analysis);
      throw error;
    }
  }
}

export const analysisService = new AnalysisService();
