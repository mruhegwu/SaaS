import api from './api';

export interface Analysis {
  id: string;
  repositoryId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  summary: string;
  issues: Array<{ severity: 'high' | 'medium' | 'low'; description: string; file?: string }>;
  suggestions: Array<{ category: string; description: string }>;
  codeQualityScore: number;
  techDebt: number;
  securityRisks: Array<{ description: string; severity: 'high' | 'medium' | 'low' }>;
  testCoverage: number;
  createdAt: string;
  updatedAt: string;
}

export async function triggerAnalysis(repoId: string): Promise<Analysis> {
  const response = await api.post(`/analysis/${repoId}/analyze`);
  return response.data;
}

export async function getAnalysis(repoId: string): Promise<Analysis> {
  const response = await api.get(`/analysis/${repoId}`);
  return response.data;
}
