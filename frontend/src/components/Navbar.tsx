import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg hover:text-blue-400 transition-colors">
          <span>⚡</span>
          <span>GitHub AI DevOps</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-300 hover:text-white text-sm transition-colors">
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-gray-600"
                />
              )}
              <span className="text-gray-300 text-sm">{user.username}</span>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-400 text-sm transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
