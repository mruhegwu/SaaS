import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export interface CodeAnalysisResult {
  summary: string;
  issues: Array<{ severity: 'high' | 'medium' | 'low'; description: string; file?: string }>;
  suggestions: Array<{ category: string; description: string }>;
  codeQualityScore: number;
  techDebt: number;
  securityRisks: Array<{ description: string; severity: 'high' | 'medium' | 'low' }>;
  testCoverage: number;
}

export async function analyzeCode(
  repoName: string,
  language: string,
  fileTree: string[],
  sampleCode: string
): Promise<CodeAnalysisResult> {
  const client = getClient();

  if (!client) {
    return generateFallbackAnalysis(repoName, language, fileTree);
  }

  const prompt = `You are a senior software engineer performing a comprehensive code analysis.

Repository: ${repoName}
Primary Language: ${language}
Files: ${fileTree.slice(0, 50).join(', ')}

Sample code:
\`\`\`
${sampleCode.substring(0, 3000)}
\`\`\`

Analyze this repository and return a JSON object with this exact structure:
{
  "summary": "brief overview of the codebase",
  "issues": [{"severity": "high|medium|low", "description": "...", "file": "optional"}],
  "suggestions": [{"category": "...", "description": "..."}],
  "codeQualityScore": 0-100,
  "techDebt": 0-100,
  "securityRisks": [{"description": "...", "severity": "high|medium|low"}],
  "testCoverage": 0-100
}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as CodeAnalysisResult;
  } catch (err) {
    console.error('OpenAI analysis failed, using fallback:', err);
    return generateFallbackAnalysis(repoName, language, fileTree);
  }
}

export async function generateCICDYaml(
  repoName: string,
  language: string,
  techStack: string[],
  defaultBranch: string
): Promise<string> {
  const client = getClient();

  if (!client) {
    return generateFallbackYaml(repoName, language, techStack, defaultBranch);
  }

  const prompt = `Generate a complete GitHub Actions CI/CD workflow YAML for:
Repository: ${repoName}
Language: ${language}
Tech Stack: ${techStack.join(', ')}
Default Branch: ${defaultBranch}

Include: build, test, lint steps. Return only the raw YAML content, no markdown.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    });
    return response.choices[0]?.message?.content || generateFallbackYaml(repoName, language, techStack, defaultBranch);
  } catch (err) {
    console.error('OpenAI YAML generation failed, using fallback:', err);
    return generateFallbackYaml(repoName, language, techStack, defaultBranch);
  }
}

function generateFallbackAnalysis(repoName: string, language: string, fileTree: string[]): CodeAnalysisResult {
  const hasTests = fileTree.some((f) => f.includes('test') || f.includes('spec'));
  const hasConfig = fileTree.some((f) => f.includes('config') || f.includes('.env'));

  return {
    summary: `${repoName} is a ${language || 'multi-language'} project with ${fileTree.length} files. Static analysis performed without AI (OPENAI_API_KEY not configured).`,
    issues: [
      { severity: 'medium', description: 'Enable AI-powered analysis by configuring OPENAI_API_KEY for detailed insights.' },
      ...(!hasTests ? [{ severity: 'high' as const, description: 'No test files detected. Consider adding a test suite.' }] : []),
      ...(!hasConfig ? [{ severity: 'low' as const, description: 'No environment configuration files found.' }] : []),
    ],
    suggestions: [
      { category: 'Testing', description: 'Add unit and integration tests to improve code reliability.' },
      { category: 'Documentation', description: 'Ensure README and inline documentation are up to date.' },
      { category: 'CI/CD', description: 'Use the pipeline generator to set up automated workflows.' },
    ],
    codeQualityScore: 65,
    techDebt: 35,
    securityRisks: [
      { description: 'Review dependency versions for known vulnerabilities.', severity: 'medium' },
    ],
    testCoverage: hasTests ? 40 : 0,
  };
}

function generateFallbackYaml(
  repoName: string,
  language: string,
  _techStack: string[],
  defaultBranch: string
): string {
  const isNode = language?.toLowerCase() === 'javascript' || language?.toLowerCase() === 'typescript';
  const isPython = language?.toLowerCase() === 'python';

  if (isNode) {
    return `name: CI/CD Pipeline - ${repoName}

on:
  push:
    branches: [ ${defaultBranch} ]
  pull_request:
    branches: [ ${defaultBranch} ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint --if-present
      - name: Build
        run: npm run build --if-present
      - name: Test
        run: npm test --if-present
`;
  }

  if (isPython) {
    return `name: CI/CD Pipeline - ${repoName}

on:
  push:
    branches: [ ${defaultBranch} ]
  pull_request:
    branches: [ ${defaultBranch} ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Lint
        run: pip install flake8 && flake8 .
      - name: Test
        run: python -m pytest
`;
  }

  return `name: CI/CD Pipeline - ${repoName}

on:
  push:
    branches: [ ${defaultBranch} ]
  pull_request:
    branches: [ ${defaultBranch} ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: echo "Configure your build steps here"
`;
}
