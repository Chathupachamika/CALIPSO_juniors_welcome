import { useEffect, useState } from 'react';
import { useAuthStore } from '../contexts/authStore';
import { teamService, scoreService } from '../services/api';
import type { Team, Leaderboard } from '../types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.teamId) {
          const teamResponse = await teamService.getById(user.teamId);
          setTeam(teamResponse.data);
        }

        const leaderboardResponse = await scoreService.getLeaderboard();
        setLeaderboard(leaderboardResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.teamId]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">
          {team ? (
            <>Your team: <span className="font-bold">{team.name}</span></>
          ) : (
            'Waiting to be assigned to a team'
          )}
        </p>
      </div>

      {/* Your Team Card */}
      {team && (
        <div className={`p-8 rounded-lg text-white ${
          team.name === 'Earth' ? 'bg-gradient-earth' :
          team.name === 'Water' ? 'bg-gradient-water' :
          team.name === 'Fire' ? 'bg-gradient-fire' :
          'bg-gradient-air'
        }`}>
          <h2 className="text-3xl font-bold mb-4">{team.name} Team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/80">Current Score</p>
              <p className="text-5xl font-bold">{team.score}</p>
            </div>
            <div>
              <p className="text-white/80">Team Members</p>
              <p className="text-5xl font-bold">{team.members?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-400 w-8">{index + 1}</span>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="font-semibold">{entry.name}</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
