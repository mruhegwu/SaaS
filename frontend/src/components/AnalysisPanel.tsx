import { useState, useEffect, useCallback } from 'react';
import { triggerAnalysis, getAnalysis, Analysis } from '../services/analysis.service';

interface AnalysisPanelProps {
  repoId: string;
  detailed?: boolean;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">{Math.round(value)}/100</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-red-900/50 text-red-300 border-red-700',
    medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    low: 'bg-blue-900/50 text-blue-300 border-blue-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${styles[severity]} uppercase`}>
      {severity}
    </span>
  );
}

export default function AnalysisPanel({ repoId, detailed = false }: AnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalysis = useCallback(async () => {
    try {
      const data = await getAnalysis(repoId);
      setAnalysis(data);
      if (data.status === 'pending' || data.status === 'running') {
        setTimeout(fetchAnalysis, 3000);
      }
    } catch {
      // no analysis yet
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  const handleTrigger = async () => {
    setTriggering(true);
    setError('');
    try {
      const result = await triggerAnalysis(repoId);
      setAnalysis(result);
      setTimeout(fetchAnalysis, 3000);
    } catch {
      setError('Failed to start analysis. Please try again.');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return <div className="bg-gray-800 rounded-2xl p-8 animate-pulse h-48" />;
  }

  if (!analysis) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Analysis Yet</h3>
        <p className="text-gray-400 mb-6">Run an AI-powered analysis to get code quality insights.</p>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {triggering ? 'Starting...' : '▶ Run Analysis'}
        </button>
      </div>
    );
  }

  if (analysis.status === 'pending' || analysis.status === 'running') {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4 animate-spin">⚙️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Analysis in Progress</h3>
        <p className="text-gray-400">This may take a moment. Results will appear automatically.</p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
        <p className="text-gray-400 mb-4">Something went wrong. Please try again.</p>
        <button onClick={handleTrigger} className="bg-red-700 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const issues = (analysis.issues as Array<{ severity: 'high' | 'medium' | 'low'; description: string; file?: string }>) || [];
  const suggestions = (analysis.suggestions as Array<{ category: string; description: string }>) || [];
  const securityRisks = (analysis.securityRisks as Array<{ description: string; severity: 'high' | 'medium' | 'low' }>) || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">📝 Summary</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Scores */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-5">📊 Metrics</h3>
        <div className="space-y-4">
          <ScoreBar label="Code Quality Score" value={analysis.codeQualityScore || 0} color="bg-blue-500" />
          <ScoreBar label="Test Coverage" value={analysis.testCoverage || 0} color="bg-green-500" />
          <ScoreBar label="Tech Debt" value={100 - (analysis.techDebt || 0)} color="bg-yellow-500" />
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">⚠️ Issues ({issues.length})</h3>
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-700/40 rounded-xl p-4">
                <SeverityBadge severity={issue.severity} />
                <div>
                  <p className="text-gray-200 text-sm">{issue.description}</p>
                  {issue.file && <p className="text-gray-500 text-xs mt-1">📄 {issue.file}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Risks */}
      {securityRisks.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔒 Security Risks</h3>
          <div className="space-y-3">
            {securityRisks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-700/40 rounded-xl p-4">
                <SeverityBadge severity={risk.severity} />
                <p className="text-gray-200 text-sm">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {(detailed || suggestions.length > 0) && suggestions.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Suggestions</h3>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-gray-700/40 rounded-xl p-4">
                <span className="text-blue-400 text-xs font-semibold uppercase">{s.category}</span>
                <p className="text-gray-200 text-sm mt-1">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
        >
          {triggering ? 'Starting...' : '↻ Re-run Analysis'}
        </button>
      </div>
    </div>
  );
}
