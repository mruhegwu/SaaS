import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RepositoryPage from './pages/RepositoryPage';
import AnalysisPage from './pages/AnalysisPage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/repos/:repoId" element={<PrivateRoute><RepositoryPage /></PrivateRoute>} />
        <Route path="/repos/:repoId/analysis" element={<PrivateRoute><AnalysisPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function AuthCallback() {
  const { setToken } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    setToken(token);
    window.location.href = '/';
  }
  return <div className="flex items-center justify-center h-screen text-gray-400">Authenticating...</div>;
}
