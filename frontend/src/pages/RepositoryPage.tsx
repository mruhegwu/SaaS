import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AnalysisPanel from '../components/AnalysisPanel';
import PipelinePanel from '../components/PipelinePanel';
import { listRepos, ImportedRepo } from '../services/repo.service';

type Tab = 'analysis' | 'pipeline';

export default function RepositoryPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [repo, setRepo] = useState<ImportedRepo | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [loading, setLoading] = useState(true);

  const loadRepo = useCallback(async () => {
    if (!repoId) return;
    try {
      const repos = await listRepos();
      const found = repos.find((r) => r.id === repoId);
      setRepo(found || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => { loadRepo(); }, [loadRepo]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-2xl p-8 animate-pulse h-32" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Repository not found.</p>
        <Link to="/" className="text-blue-400 hover:underline mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Dashboard
        </Link>
        <div className="mt-3 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{repo.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{repo.fullName}</p>
            {repo.description && <p className="text-gray-300 mt-2">{repo.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {repo.language && (
              <span className="bg-blue-900/50 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-700">
                {repo.language}
              </span>
            )}
            {repo.private && (
              <span className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full">
                Private
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <TabButton label="🔍 Analysis" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
        <TabButton label="🚀 Pipeline" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
      </div>

      {activeTab === 'analysis' && <AnalysisPanel repoId={repo.id} />}
      {activeTab === 'pipeline' && <PipelinePanel repoId={repo.id} />}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 font-medium transition-colors ${
        active
          ? 'text-white border-b-2 border-blue-500'
          : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
