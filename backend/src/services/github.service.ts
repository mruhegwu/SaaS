import axios from 'axios';
import { logger } from '../config/logger';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  private: boolean;
  clone_url: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';

  async getAccessToken(code: string): Promise<string> {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const { access_token, error } = response.data;
    if (error) {
      throw new Error(`GitHub OAuth error: ${error}`);
    }
    return access_token;
  }

  async getUser(accessToken: string): Promise<GitHubUser> {
    const response = await axios.get(`${this.baseUrl}/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getUserEmail(accessToken: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/user/emails`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emails: Array<{ email: string; primary: boolean; verified: boolean }> = response.data;
    const primary = emails.find((e) => e.primary && e.verified);
    return primary?.email || emails[0]?.email || '';
  }

  async getUserRepos(accessToken: string, page = 1): Promise<GitHubRepo[]> {
    const response = await axios.get(
      `${this.baseUrl}/user/repos?sort=updated&per_page=50&page=${page}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  async getRepoContents(
    accessToken: string,
    owner: string,
    repo: string,
    path = ''
  ): Promise<unknown[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      logger.error(`Failed to get repo contents: ${error}`);
      return [];
    }
  }

  async getFileContent(
    accessToken: string,
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const content = response.data.content;
      return Buffer.from(content, 'base64').toString('utf-8');
    } catch (error) {
      logger.error(`Failed to get file content: ${error}`);
      return '';
    }
  }

  async createPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<{ html_url: string; number: number }> {
    const response = await axios.post(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls`,
      { title, body, head, base },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  async createBranch(
    accessToken: string,
    owner: string,
    repo: string,
    branchName: string,
    fromSha: string
  ): Promise<void> {
    await axios.post(
      `${this.baseUrl}/repos/${owner}/${repo}/git/refs`,
      {
        ref: `refs/heads/${branchName}`,
        sha: fromSha,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }

  async getLatestCommitSha(
    accessToken: string,
    owner: string,
    repo: string,
    branch: string
  ): Promise<string> {
    const response = await axios.get(
      `${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data.object.sha;
  }

  async createOrUpdateFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    branch: string,
    sha?: string
  ): Promise<void> {
    await axios.put(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
      {
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha }),
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }
}

export const githubService = new GitHubService();
