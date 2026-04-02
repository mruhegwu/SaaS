import axios from 'axios';

const GITHUB_API = 'https://api.github.com';
const GITHUB_OAUTH = 'https://github.com';

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await axios.post(
    `${GITHUB_OAUTH}/login/oauth/access_token`,
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: 'application/json' } }
  );
  const { access_token, error } = response.data as { access_token?: string; error?: string };
  if (error || !access_token) {
    throw new Error(error || 'Failed to exchange code for token');
  }
  return access_token;
}

export async function getGithubUser(token: string): Promise<{
  id: number;
  login: string;
  email: string;
  avatar_url: string;
}> {
  const response = await axios.get(`${GITHUB_API}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as { id: number; login: string; email: string; avatar_url: string };
}

export async function listUserRepos(token: string): Promise<GithubRepo[]> {
  const response = await axios.get(`${GITHUB_API}/user/repos`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { per_page: 100, sort: 'updated' },
  });
  return response.data as GithubRepo[];
}

export async function getRepoContents(
  token: string,
  owner: string,
  repo: string,
  path = ''
): Promise<GithubContent[]> {
  const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = response.data;
  return Array.isArray(data) ? data as GithubContent[] : [data as GithubContent];
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const file = response.data as { content?: string; encoding?: string };
  if (file.encoding === 'base64' && file.content) {
    return Buffer.from(file.content, 'base64').toString('utf-8');
  }
  return '';
}

export async function getDefaultBranch(
  token: string,
  owner: string,
  repo: string
): Promise<string> {
  const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (response.data as { default_branch: string }).default_branch || 'main';
}

export async function getBranchSha(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (response.data as { object: { sha: string } }).object.sha;
}

export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  sha: string
): Promise<void> {
  await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
    { ref: `refs/heads/${branch}`, sha },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  message: string,
  content: string,
  branch: string
): Promise<void> {
  await axios.put(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string
): Promise<string> {
  const response = await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls`,
    { title, body, head, base },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return (response.data as { html_url: string }).html_url;
}

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

export interface GithubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}
