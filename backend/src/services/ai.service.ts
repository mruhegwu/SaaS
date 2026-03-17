import OpenAI from 'openai';
import { logger } from '../config/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export interface AnalysisResult {
  summary: string;
  codeQuality: { score: number; issues: string[]; strengths: string[] };
  securityIssues: { critical: string[]; warnings: string[] };
  improvements: { immediate: string[]; longTerm: string[] };
  techDebt: { estimate: string; areas: string[] };
  overallScore: number;
}

export class AIService {
  async analyzeRepository(
    repoName: string,
    language: string | null,
    fileStructure: string,
    sampleCode: string
  ): Promise<AnalysisResult> {
    const prompt = `You are an expert software architect analyzing a GitHub repository.
Repository: ${repoName}
Primary Language: ${language || 'Unknown'}
File Structure:\n${fileStructure}
Sample Code:\n${sampleCode}

Return valid JSON only:
{
  "summary": "Brief overview",
  "codeQuality": { "score": <0-100>, "issues": [], "strengths": [] },
  "securityIssues": { "critical": [], "warnings": [] },
  "improvements": { "immediate": [], "longTerm": [] },
  "techDebt": { "estimate": "Low/Medium/High", "areas": [] },
  "overallScore": <0-100>
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert software architect. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      const content = response.choices[0].message.content || '{}';
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonStr) as AnalysisResult;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return {
        summary: 'Analysis unavailable - AI service error or API key not configured.',
        codeQuality: { score: 50, issues: ['AI analysis not available'], strengths: ['Repository exists'] },
        securityIssues: { critical: [], warnings: ['Configure OpenAI API key for security scan'] },
        improvements: { immediate: ['Configure OPENAI_API_KEY'], longTerm: ['Add CI/CD pipelines'] },
        techDebt: { estimate: 'Unknown', areas: [] },
        overallScore: 50,
      };
    }
  }

  async generateCICDPipeline(
    repoName: string,
    language: string | null,
    fileStructure: string,
    framework: string | null
  ): Promise<{ workflow: string; dockerfile?: string; explanation: string }> {
    const prompt = `You are a DevOps expert. Generate a GitHub Actions CI/CD workflow for:
Repository: ${repoName}, Language: ${language || 'Unknown'}, Framework: ${framework || 'Unknown'}
File Structure:\n${fileStructure}

Return valid JSON:
{ "workflow": "<YAML>", "dockerfile": "<Dockerfile or null>", "explanation": "..." }`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a DevOps expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });
      const content = response.choices[0].message.content || '{}';
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      logger.error('CI/CD generation failed:', error);
      return { workflow: this.getDefaultWorkflow(language), explanation: 'Default workflow - configure OpenAI API key for custom pipelines' };
    }
  }

  private getDefaultWorkflow(language: string | null): string {
    return `name: CI/CD Pipeline\n\non:\n  push:\n    branches: [ main, develop ]\n  pull_request:\n    branches: [ main ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build\n        run: echo "Build ${language || 'project'} here"`;
  }
}

export const aiService = new AIService();
