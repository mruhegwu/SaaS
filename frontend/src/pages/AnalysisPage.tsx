import { useParams, Link } from 'react-router-dom';
import AnalysisPanel from '../components/AnalysisPanel';

export default function AnalysisPage() {
  const { repoId } = useParams<{ repoId: string }>();

  if (!repoId) {
    return <div className="text-center py-20 text-gray-400">Invalid repository.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to={`/repos/${repoId}`} className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Back to Repository
        </Link>
        <h1 className="text-3xl font-bold text-white mt-3">Code Analysis</h1>
        <p className="text-gray-400 mt-1">Detailed AI-powered analysis results</p>
      </div>
      <AnalysisPanel repoId={repoId} detailed />
    </div>
  );
}
