import { AppDataSource } from '../database/connection';
import { Pipeline } from '../models/Pipeline';
import { Repository } from '../models/Repository';
import { decryptToken } from './encryption.service';
import { getRepoContents, getDefaultBranch, getBranchSha, createBranch, createOrUpdateFile, createPullRequest } from './github.service';
import { generateCICDYaml } from './ai.service';

export async function generatePipeline(repositoryId: string, userId: string): Promise<Pipeline> {
  const repoRepo = AppDataSource.getRepository(Repository);
  const pipelineRepo = AppDataSource.getRepository(Pipeline);
  const userRepo = AppDataSource.getRepository(
    (await import('../models/User')).User
  );

  const repo = await repoRepo.findOne({ where: { id: repositoryId, userId } });
  if (!repo) throw Object.assign(new Error('Repository not found'), { status: 404 });

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user?.accessToken) throw new Error('User access token not found');

  const token = decryptToken(user.accessToken);
  const [owner, repoName] = repo.fullName.split('/');

  const contents = await getRepoContents(token, owner, repoName).catch(() => []);
  const techStack = detectTechStack(contents.map((c) => c.name));
  const defaultBranch = await getDefaultBranch(token, owner, repoName);

  const yamlContent = await generateCICDYaml(
    repo.name,
    repo.language || 'Unknown',
    techStack,
    defaultBranch
  );

  const pipeline = pipelineRepo.create({
    repositoryId,
    name: `CI/CD Pipeline for ${repo.name}`,
    yamlContent,
    status: 'draft',
  });

  await pipelineRepo.save(pipeline);
  return pipeline;
}

export async function deployPipeline(
  pipelineId: string,
  repositoryId: string,
  userId: string
): Promise<Pipeline> {
  const pipelineRepo = AppDataSource.getRepository(Pipeline);
  const repoRepo = AppDataSource.getRepository(Repository);
  const userRepo = AppDataSource.getRepository(
    (await import('../models/User')).User
  );

  const pipeline = await pipelineRepo.findOne({ where: { id: pipelineId, repositoryId } });
  if (!pipeline) throw Object.assign(new Error('Pipeline not found'), { status: 404 });

  const repo = await repoRepo.findOne({ where: { id: repositoryId, userId } });
  if (!repo) throw Object.assign(new Error('Repository not found'), { status: 404 });

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user?.accessToken) throw new Error('User access token not found');

  const token = decryptToken(user.accessToken);
  const [owner, repoName] = repo.fullName.split('/');

  const defaultBranch = await getDefaultBranch(token, owner, repoName);
  const sha = await getBranchSha(token, owner, repoName, defaultBranch);
  const featureBranch = `feature/add-cicd-pipeline-${Date.now()}`;

  await createBranch(token, owner, repoName, featureBranch, sha);
  await createOrUpdateFile(
    token,
    owner,
    repoName,
    '.github/workflows/ci-cd.yml',
    'chore: add CI/CD pipeline workflow',
    pipeline.yamlContent,
    featureBranch
  );

  const prUrl = await createPullRequest(
    token,
    owner,
    repoName,
    'Add CI/CD Pipeline Workflow',
    'This PR adds an AI-generated CI/CD pipeline workflow via GitHub AI DevOps Platform.',
    featureBranch,
    defaultBranch
  );

  await pipelineRepo.update(pipelineId, { status: 'deployed', prUrl });
  pipeline.status = 'deployed';
  pipeline.prUrl = prUrl;
  return pipeline;
}

export async function getPipelinesForRepo(repositoryId: string): Promise<Pipeline[]> {
  const pipelineRepo = AppDataSource.getRepository(Pipeline);
  return pipelineRepo.find({ where: { repositoryId }, order: { createdAt: 'DESC' } });
}

function detectTechStack(fileNames: string[]): string[] {
  const stack: string[] = [];
  const names = fileNames.map((f) => f.toLowerCase());

  if (names.some((n) => n === 'package.json')) stack.push('Node.js');
  if (names.some((n) => n === 'requirements.txt' || n === 'pyproject.toml')) stack.push('Python');
  if (names.some((n) => n === 'go.mod')) stack.push('Go');
  if (names.some((n) => n === 'pom.xml' || n === 'build.gradle')) stack.push('Java');
  if (names.some((n) => n === 'cargo.toml')) stack.push('Rust');
  if (names.some((n) => n === 'gemfile')) stack.push('Ruby');
  if (names.some((n) => n.endsWith('.csproj') || n.endsWith('.sln'))) stack.push('.NET');
  if (names.some((n) => n === 'docker-compose.yml' || n === 'dockerfile')) stack.push('Docker');

  return stack.length > 0 ? stack : ['Generic'];
}
