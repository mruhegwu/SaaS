import { AppDataSource } from '../database/connection';
import { Analysis } from '../models/Analysis';
import { Repository } from '../models/Repository';
import { decryptToken } from './encryption.service';
import { getRepoContents, getFileContent } from './github.service';
import { analyzeCode } from './ai.service';

export async function triggerAnalysis(repositoryId: string, userId: string): Promise<Analysis> {
  const repoRepo = AppDataSource.getRepository(Repository);
  const analysisRepo = AppDataSource.getRepository(Analysis);

  const repo = await repoRepo.findOne({ where: { id: repositoryId, userId } });
  if (!repo) throw Object.assign(new Error('Repository not found'), { status: 404 });

  const existing = await analysisRepo.findOne({
    where: { repositoryId },
    order: { createdAt: 'DESC' },
  });

  if (existing && existing.status === 'running') {
    return existing;
  }

  const analysis = analysisRepo.create({ repositoryId, status: 'pending' });
  await analysisRepo.save(analysis);

  runAnalysisInBackground(analysis.id, repo, userId).catch((err) => {
    console.error('Background analysis error:', err);
  });

  return analysis;
}

async function runAnalysisInBackground(
  analysisId: string,
  repo: Repository,
  userId: string
): Promise<void> {
  const analysisRepo = AppDataSource.getRepository(Analysis);
  const userRepo = AppDataSource.getRepository(
    (await import('../models/User')).User
  );

  await analysisRepo.update(analysisId, { status: 'running' });

  try {
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user?.accessToken) throw new Error('User access token not found');

    const token = decryptToken(user.accessToken);
    const [owner, repoName] = repo.fullName.split('/');

    const contents = await getRepoContents(token, owner, repoName).catch(() => []);
    const fileTree = contents.map((c) => c.path);

    let sampleCode = '';
    const codeFiles = contents.filter(
      (c) => c.type === 'file' && /\.(ts|js|py|go|java|rb|rs|cs)$/.test(c.name)
    );

    for (const file of codeFiles.slice(0, 3)) {
      try {
        const content = await getFileContent(token, owner, repoName, file.path);
        sampleCode += `\n// ${file.path}\n${content.substring(0, 500)}`;
      } catch {
        // skip unreadable files
      }
    }

    const result = await analyzeCode(
      repo.name,
      repo.language || 'Unknown',
      fileTree,
      sampleCode
    );

    await analysisRepo.update(analysisId, {
      status: 'completed',
      summary: result.summary,
      issues: result.issues,
      suggestions: result.suggestions,
      codeQualityScore: result.codeQualityScore,
      techDebt: result.techDebt,
      securityRisks: result.securityRisks,
      testCoverage: result.testCoverage,
    });
  } catch (err) {
    console.error('Analysis failed:', err);
    await analysisRepo.update(analysisId, { status: 'failed' });
  }
}

export async function getLatestAnalysis(repositoryId: string): Promise<Analysis | null> {
  const analysisRepo = AppDataSource.getRepository(Analysis);
  return analysisRepo.findOne({
    where: { repositoryId },
    order: { createdAt: 'DESC' },
  });
}
