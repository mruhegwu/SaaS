import { useState, useEffect, useCallback } from 'react';
import { generatePipeline, deployPipeline, listPipelines, Pipeline } from '../services/cicd.service';

interface PipelinePanelProps {
  repoId: string;
}

export default function PipelinePanel({ repoId }: PipelinePanelProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selected, setSelected] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState('');

  const fetchPipelines = useCallback(async () => {
    try {
      const data = await listPipelines(repoId);
      setPipelines(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [repoId, selected]);

  useEffect(() => { fetchPipelines(); }, [fetchPipelines]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const pipeline = await generatePipeline(repoId);
      setPipelines((prev) => [pipeline, ...prev]);
      setSelected(pipeline);
    } catch {
      setError('Failed to generate pipeline. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeploy = async (pipeline: Pipeline) => {
    setDeploying(true);
    setError('');
    try {
      const updated = await deployPipeline(repoId, pipeline.id);
      setPipelines((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelected(updated);
    } catch {
      setError('Failed to deploy pipeline. Ensure your GitHub token has repo write access.');
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return <div className="bg-gray-800 rounded-2xl p-8 animate-pulse h-48" />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">🚀 CI/CD Pipelines</h3>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {generating ? 'Generating...' : '+ Generate Pipeline'}
        </button>
      </div>

      {pipelines.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Pipelines Yet</h3>
          <p className="text-gray-400 mb-6">Generate an AI-powered CI/CD pipeline for this repository.</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            {generating ? 'Generating...' : '▶ Generate Pipeline'}
          </button>
        </div>
      ) : (
        <>
          {pipelines.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {pipelines.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`text-sm px-4 py-2 rounded-xl transition-colors ${
                    selected?.id === p.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {new Date(p.createdAt).toLocaleDateString()}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div>
                  <h4 className="text-white font-semibold">{selected.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <StatusBadge status={selected.status} />
                    <span className="text-gray-500 text-xs">{new Date(selected.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selected.prUrl && (
                    <a
                      href={selected.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      View PR →
                    </a>
                  )}
                  {selected.status === 'draft' && (
                    <button
                      onClick={() => handleDeploy(selected)}
                      disabled={deploying}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                      {deploying ? 'Deploying...' : '🚀 Deploy (Open PR)'}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <pre className="text-gray-300 text-sm overflow-x-auto bg-gray-900 rounded-xl p-4 border border-gray-700 leading-relaxed">
                  <code>{selected.yamlContent}</code>
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Pipeline['status'] }) {
  const styles = {
    draft: 'bg-gray-700 text-gray-300',
    deployed: 'bg-green-900/50 text-green-300 border border-green-700',
    failed: 'bg-red-900/50 text-red-300 border border-red-700',
  };
  const labels = { draft: '📝 Draft', deployed: '✅ Deployed', failed: '❌ Failed' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
