import { useEffect, useRef, useState } from 'react';
import { scoreService } from '../services/api';
import type { Leaderboard } from '../types';

const REFRESH_INTERVAL_MS = 10000;

const teamGradient = (name: string) => {
  switch (name) {
    case 'Earth':
      return 'bg-gradient-earth';
    case 'Water':
      return 'bg-gradient-water';
    case 'Fire':
      return 'bg-gradient-fire';
    default:
      return 'bg-gradient-air';
  }
};

const rankMedal = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

function LeaderboardSkeleton() {
  return (
    <div>
      <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [boostedIds, setBoostedIds] = useState<Set<string>>(new Set());
  const prevScoresRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        const response = await scoreService.getLeaderboard();
        const data: Leaderboard[] = response.data;
        const sorted = [...data].sort((a, b) => b.score - a.score);

        if (!isMounted) return;

        // Detect which teams' scores went up since the last poll, to briefly highlight them
        const increased = new Set<string>();
        sorted.forEach((team) => {
          const prev = prevScoresRef.current.get(team._id);
          if (prev !== undefined && team.score > prev) {
            increased.add(team._id);
          }
          prevScoresRef.current.set(team._id, team.score);
        });

        setLeaderboard(sorted);
        setLastUpdated(new Date());

        if (increased.size > 0) {
          setBoostedIds(increased);
          setTimeout(() => setBoostedIds(new Set()), 2500);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-2">
        <h1 className="text-4xl font-bold">🏆 Leaderboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          Live
          {lastUpdated && (
            <span className="text-gray-400">
              · updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          No teams on the leaderboard yet.
        </div>
      ) : (
        <>
          {/* Podium — top 3 teams */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
            {podium.map((team, index) => {
              const rank = index + 1;
              const isBoosted = boostedIds.has(team._id);
              return (
                <div
                  key={team._id}
                  className={`relative rounded-2xl text-white p-6 shadow-lg transition-transform duration-300 ${teamGradient(
                    team.name
                  )} ${rank === 1 ? 'md:order-2 md:scale-105 md:py-8' : rank === 2 ? 'md:order-1' : 'md:order-3'} ${
                    isBoosted ? 'ring-4 ring-yellow-300 ring-offset-2' : ''
                  }`}
                >
                  <div className="absolute top-4 right-4 text-4xl drop-shadow">
                    {rankMedal(rank)}
                  </div>
                  <div className="text-sm font-semibold text-white/70 mb-1">
                    RANK #{rank}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{team.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-extrabold tabular-nums">
                      {team.score}
                    </span>
                    <span className="text-white/70 text-sm">pts</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {team.members?.length || 0} member{team.members?.length === 1 ? '' : 's'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Remaining ranked teams */}
          {rest.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {rest.map((team, index) => {
                  const rank = index + 4;
                  const isBoosted = boostedIds.has(team._id);
                  return (
                    <div
                      key={team._id}
                      className={`flex items-center justify-between p-4 transition-colors duration-500 ${
                        isBoosted ? 'bg-yellow-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-400 w-8 text-center tabular-nums">
                          {rank}
                        </span>
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{team.name}</p>
                          <p className="text-xs text-gray-500">
                            {team.members?.length || 0} member{team.members?.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-blue-600 tabular-nums">
                        {team.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}