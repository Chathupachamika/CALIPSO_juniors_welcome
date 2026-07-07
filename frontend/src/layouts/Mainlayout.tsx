import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';

export default function MainLayout() {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-blue-600">🌍 CALIPSO</h1>
            <nav className="flex gap-6">
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Leaderboard
              </button>
              <button
                onClick={() => navigate('/events')}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Events
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-gray-600 hover:text-blue-600 transition font-semibold"
                >
                  Admin
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
