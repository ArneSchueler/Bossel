import { useState } from "react";
import { Trophy, Medal, Play, RotateCcw, PartyPopper } from "lucide-react";
import type { GameState, Team } from "../types";

interface Props {
  state: GameState;
  updateState: (
    updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>),
  ) => void;
}

export default function Summary({ state, updateState }: Props) {
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [overallWinners, setOverallWinners] = useState<
    (Team & { wins: number })[] | null
  >(null);

  if (state.teams.length === 0) {
    return (
      <div className="text-center p-6 text-slate-500">
        Play a round to see the summary.
      </div>
    );
  }

  // Calculate current round totals
  const currentScores = state.teams
    .map((team) => {
      const total = state.throws
        .filter((t) => t.teamId === team.id)
        .reduce((sum, t) => sum + t.points, 0);
      return { ...team, total };
    })
    .sort((a, b) => a.total - b.total); // Sort by lowest points (winner first)

  // Overall standings
  const standings = state.teams
    .map((team) => ({
      ...team,
      wins: state.roundWins[team.id] || 0,
    }))
    .sort((a, b) => b.wins - a.wins);

  const maxPoints = Math.max(...currentScores.map((t) => t.total), 1); // Avoid division by 0

  const startNextRound = () => {
    updateState({
      throws: [],
      currentTurn: null,
      phase: "play",
    });
  };

  const finishGame = () => {
    setShowFinishConfirm(true);
  };

  const resetGame = () => {
    updateState({
      phase: "setup",
      players: [],
      teamCount: 2,
      teams: [],
      throws: [],
      roundWins: {},
      currentTurn: null,
    });
  };

  const handleFinishGameConfirm = () => {
    setShowFinishConfirm(false);

    const maxWins = standings.length > 0 ? standings[0].wins : 0;
    const winners = standings.filter(
      (team) => team.wins === maxWins && maxWins > 0,
    );

    if (winners.length > 0) {
      setOverallWinners(winners);
    } else {
      // No winners, just reset as the user confirmed finishing.
      resetGame();
    }
  };

  const hasThrows = state.throws.length > 0;
  const minScore = currentScores.length > 0 ? currentScores[0].total : 0;
  const roundWinners = hasThrows
    ? currentScores.filter((t) => t.total === minScore)
    : [];

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
              {roundWinners.length > 1 ? "Round Winners (Tie)" : "Round Winner"}
            </p>
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {roundWinners.map((w) => w.name).join(" & ")}
            </h2>
            <div className="inline-block bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-brand-mint font-bold">
                {minScore} Points
              </span>
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
            <div
              key={team.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-700"}`}
                >
                  {idx + 1}
                </div>
                <span className="font-bold text-slate-800">{team.name}</span>
              </div>
              <div className="text-sm font-bold text-brand-dark bg-brand-mint/30 px-3 py-1 rounded-full">
                {team.wins} {team.wins === 1 ? "Win" : "Wins"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tournament Progress (Bar Chart) */}
      {hasThrows && (
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Current Round Points
          </h3>
          <div className="space-y-4">
            {currentScores.map((team) => {
              const percentage = (team.total / maxPoints) * 100;
              return (
                <div key={team.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {team.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {team.total} pts
                    </span>
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

      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-800">Finish Game?</h3>
            <p className="text-slate-600 my-4">
              Are you sure you want to finish the game? The overall winner will
              be declared.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishGameConfirm}
                className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Yes, Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {overallWinners && (
        <div className="fixed inset-0 bg-gradient-to-br from-brand-dark to-emerald-900 flex items-center justify-center z-50 p-4 text-center">
          <div className="relative">
            <div className="absolute -inset-4 text-brand-mint/10 animate-pulse">
              <Trophy size={200} className="mx-auto" />
            </div>
            <div className="relative z-10">
              <PartyPopper className="mx-auto text-amber-400 mb-4" size={64} />
              <h2 className="text-4xl font-extrabold text-white mb-2">
                {overallWinners.length > 1
                  ? "Overall Winners!"
                  : "Overall Winner!"}
              </h2>
              <p className="text-emerald-300 text-lg mb-4">
                Congratulations to
              </p>
              <h3 className="text-3xl font-bold text-white mb-4">
                {overallWinners.map((w) => w.name).join(" & ")}
              </h3>
              <div className="inline-block bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm mb-8">
                <span className="text-brand-mint font-bold">
                  {overallWinners[0].wins}{" "}
                  {overallWinners[0].wins === 1 ? "Win" : "Wins"}
                </span>
              </div>
              <button
                onClick={resetGame}
                className="w-full max-w-xs mx-auto bg-white text-brand-dark py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-mint transition-colors shadow-lg"
              >
                Start New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
