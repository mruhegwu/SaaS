import { ImportedRepo } from '../services/repo.service';

interface RepoCardProps {
  repo: ImportedRepo;
  onClick: () => void;
  healthScore?: number;
}

function HealthIndicator({ score }: { score?: number }) {
  if (score === undefined) return null;
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const bg = score >= 75 ? 'bg-green-900/30 border-green-700' : score >= 50 ? 'bg-yellow-900/30 border-yellow-700' : 'bg-red-900/30 border-red-700';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${bg} ${color}`}>
      <span>{score >= 75 ? '🟢' : score >= 50 ? '🟡' : '🔴'}</span>
      <span>{score}/100</span>
    </div>
  );
}

export default function RepoCard({ repo, onClick, healthScore }: RepoCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">{repo.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{repo.fullName}</p>
        </div>
        <HealthIndicator score={healthScore} />
      </div>

      {repo.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{repo.description}</p>
      )}

      <div className="flex items-center gap-3 mt-auto">
        {repo.language && (
          <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800 px-2.5 py-1 rounded-full">
            {repo.language}
          </span>
        )}
        {repo.private && (
          <span className="text-xs text-gray-400 bg-gray-700 px-2.5 py-1 rounded-full">
            🔒 Private
          </span>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          {new Date(repo.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
