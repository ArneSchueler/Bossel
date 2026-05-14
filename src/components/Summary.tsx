import { Trophy, Medal, Play, RotateCcw } from 'lucide-react';
import type { GameState } from '../types';

interface Props {
  state: GameState;
  updateState: (updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => void;
}

export default function Summary({ state, updateState }: Props) {
  if (state.teams.length === 0) {
    return <div className="text-center p-6 text-slate-500">Play a round to see the summary.</div>;
  }

  // Calculate current round totals
  const currentScores = state.teams.map(team => {
    const total = state.throws.filter(t => t.teamId === team.id).reduce((sum, t) => sum + t.points, 0);
    return { ...team, total };
  }).sort((a, b) => a.total - b.total); // Sort by lowest points (winner first)

  // Overall standings
  const standings = state.teams.map(team => ({
    ...team,
    wins: state.roundWins[team.id] || 0
  })).sort((a, b) => b.wins - a.wins);

  const maxPoints = Math.max(...currentScores.map(t => t.total), 1); // Avoid division by 0

  const startNextRound = () => {
    updateState({
      throws: [],
      currentTurn: null,
      phase: 'play'
    });
  };

  const finishGame = () => {
    if (window.confirm('Are you sure you want to finish the game and reset all progress?')) {
      updateState({
        phase: 'setup',
        players: [],
        teamCount: 2,
        teams: [],
        throws: [],
        roundWins: {},
        currentTurn: null,
      });
    }
  };

  const hasThrows = state.throws.length > 0;
  const minScore = currentScores.length > 0 ? currentScores[0].total : 0;
  const roundWinners = hasThrows ? currentScores.filter(t => t.total === minScore) : [];

  return (
    <div className="space-y-6 pb-6">
      {/* Victory Card */}
      {roundWinners.length > 0 && (
        <section className="bg-gradient-to-br from-brand-dark to-emerald-900 p-6 rounded-2xl shadow-lg relative overflow-hidden text-center">
          <div className="absolute -top-10 -right-10 text-brand-mint/10">
            <Trophy size={160} />
          </div>
          <div className="relative z-10">
            <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">
              {roundWinners.length > 1 ? 'Round Winners (Tie)' : 'Round Winner'}
            </p>
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {roundWinners.map(w => w.name).join(' & ')}
            </h2>
            <div className="inline-block bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-brand-mint font-bold">{minScore} Points</span>
            </div>
          </div>
        </section>
      )}

      {/* Overall Standings */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Medal className="text-brand-accent" size={20} />
          Overall Standings
        </h3>
        <div className="space-y-3">
          {standings.map((team, idx) => (
            <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                  {idx + 1}
                </div>
                <span className="font-bold text-slate-800">{team.name}</span>
              </div>
              <div className="text-sm font-bold text-brand-dark bg-brand-mint/30 px-3 py-1 rounded-full">
                {team.wins} {team.wins === 1 ? 'Win' : 'Wins'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tournament Progress (Bar Chart) */}
      {hasThrows && (
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Current Round Points</h3>
          <div className="space-y-4">
            {currentScores.map(team => {
              const percentage = (team.total / maxPoints) * 100;
              return (
                <div key={team.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{team.name}</span>
                    <span className="font-bold text-slate-900">{team.total} pts</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-accent rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={startNextRound}
          className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-900/20"
        >
          <Play fill="currentColor" size={20} />
          Start Next Round
        </button>

        <button
          onClick={finishGame}
          className="w-full bg-slate-200 text-slate-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors shadow-sm"
        >
          <RotateCcw size={20} />
          Finish Game
        </button>
      </div>
    </div>
  );
}