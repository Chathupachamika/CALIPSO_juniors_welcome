import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">🌍 CALIPSO</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg transition"
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  {user?.name || 'Dashboard'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-4">Avatar-Themed Event Management</h2>
        <p className="text-xl mb-8 opacity-90">
          Join your team, compete, and lead them to victory!
        </p>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {['Earth', 'Water', 'Fire', 'Air'].map((team) => (
            <div
              key={team}
              className={`p-8 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition`}
            >
              <h3 className="text-2xl font-bold mb-2">{team}</h3>
              <p className="opacity-75">Join the team</p>
            </div>
          ))}
        </div>

        {!isAuthenticated && (
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Get Started Now
          </button>
        )}
      </section>
    </div>
  );
}
