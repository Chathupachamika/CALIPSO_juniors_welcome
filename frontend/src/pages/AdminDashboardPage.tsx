import { useEffect, useState } from 'react';
import { useAuthStore } from '../contexts/authStore';
import { useNavigate } from 'react-router-dom';
import { teamService, eventService } from '../services/api';
import type { Leaderboard, Event } from '../types';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Leaderboard[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'events' | 'scores'>('overview');

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

     const fetchData = async () => {
      try {
         const [teamsResponse, eventsResponse] = await Promise.all([
          teamService.getAll(),
          eventService.getAll(),
        ]);
        setTeams(teamsResponse.data);
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">⚙️ Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b flex-wrap">
        {(['overview', 'teams', 'events', 'scores'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}

        {/* QR Codes lives on its own route, so this tab just navigates there */}
        <button
          onClick={() => navigate('/admin/qrcodes')}
          className="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition"
        >
          🔍 QR Codes
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 mb-2">Total Teams</p>
            <p className="text-4xl font-bold text-blue-600">{teams.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 mb-2">Total Events</p>
            <p className="text-4xl font-bold text-green-600">{events.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 mb-2">Total Points</p>
            <p className="text-4xl font-bold text-purple-600">
              {teams.reduce((sum, team) => sum + team.score, 0)}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 mb-2">Total Members</p>
            <p className="text-4xl font-bold text-orange-600">
              {teams.reduce((sum, team) => sum + (team.members?.length || 0), 0)}
            </p>
          </div>

          {/* Quick link card to Secret QR Codes feature */}
          <div
            className="card cursor-pointer hover:shadow-lg transition md:col-span-4"
            onClick={() => navigate('/admin/qrcodes')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">🔍 Secret QR Codes</p>
                <p className="text-sm text-gray-500">
                  Create and manage hidden campus QR codes for bonus points
                </p>
              </div>
              <span className="text-blue-600 font-semibold">Manage →</span>
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <div>
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    <p className="text-gray-600">{team.members?.length || 0} members</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-blue-600">{team.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card">
              <h3 className="text-lg font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Sequence: {event.sequence}</span>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  event.status === 'pending' ? 'bg-gray-100' :
                  event.status === 'ongoing' ? 'bg-blue-100' :
                  'bg-green-100'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scores Tab */}
      {activeTab === 'scores' && (
        <div className="text-center py-12 text-gray-600">
          Go to Team page to manage scores
        </div>
      )}
    </div>
  );
}