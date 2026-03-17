import api from './api';

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  default_branch: string;
  owner: { login: string };
}

export interface ImportedRepo {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  private: boolean;
  createdAt: string;
}

export async function fetchGithubRepos(): Promise<GithubRepo[]> {
  const response = await api.get('/repos/github');
  return response.data;
}

export async function importRepo(repo: GithubRepo): Promise<ImportedRepo> {
  const response = await api.post(`/repos/import/${repo.id}`, repo);
  return response.data;
}

export async function listRepos(): Promise<ImportedRepo[]> {
  const response = await api.get('/repos');
  return response.data;
}
