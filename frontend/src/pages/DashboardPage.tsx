import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listRepos, fetchGithubRepos, importRepo, GithubRepo, ImportedRepo } from '../services/repo.service';
import RepoCard from '../components/RepoCard';

export default function DashboardPage() {
  const [repos, setRepos] = useState<ImportedRepo[]>([]);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadRepos = useCallback(async () => {
    try {
      const data = await listRepos();
      setRepos(data);
    } catch {
      setError('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRepos(); }, [loadRepos]);

  const loadGithubRepos = async () => {
    setShowImport(true);
    try {
      const data = await fetchGithubRepos();
      setGithubRepos(data);
    } catch {
      setError('Failed to fetch GitHub repositories');
    }
  };

  const handleImport = async (repo: GithubRepo) => {
    setImporting(repo.id);
    try {
      const imported = await importRepo(repo);
      setRepos((prev) => {
        const exists = prev.find((r) => r.id === imported.id);
        return exists ? prev : [imported, ...prev];
      });
      setShowImport(false);
    } catch {
      setError('Failed to import repository');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage and analyze your repositories</p>
        </div>
        <button
          onClick={showImport ? () => setShowImport(false) : loadGithubRepos}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {showImport ? '✕ Close' : '+ Import Repository'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {showImport && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your GitHub Repositories</h2>
          {githubRepos.length === 0 ? (
            <p className="text-gray-400">Loading GitHub repositories...</p>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {githubRepos.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
                  <div>
                    <p className="text-white font-medium">{repo.full_name}</p>
                    <p className="text-gray-400 text-sm truncate max-w-md">{repo.description || 'No description'}</p>
                    {repo.language && <span className="text-xs text-blue-400 mt-1">{repo.language}</span>}
                  </div>
                  <button
                    onClick={() => handleImport(repo)}
                    disabled={importing === repo.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors ml-4 shrink-0"
                  >
                    {importing === repo.id ? 'Importing...' : 'Import'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No repositories yet</h2>
          <p className="text-gray-500">Import a GitHub repository to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onClick={() => navigate(`/repos/${repo.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
