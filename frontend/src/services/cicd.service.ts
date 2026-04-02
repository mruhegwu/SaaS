import api from './api';

export interface Pipeline {
  id: string;
  repositoryId: string;
  name: string;
  yamlContent: string;
  status: 'draft' | 'deployed' | 'failed';
  prUrl: string | null;
  createdAt: string;
}

export async function generatePipeline(repoId: string): Promise<Pipeline> {
  const response = await api.post(`/cicd/${repoId}/generate`);
  return response.data;
}

export async function deployPipeline(repoId: string, pipelineId: string): Promise<Pipeline> {
  const response = await api.post(`/cicd/${repoId}/${pipelineId}/deploy`);
  return response.data;
}

export async function listPipelines(repoId: string): Promise<Pipeline[]> {
  const response = await api.get(`/cicd/${repoId}`);
  return response.data;
}
