import React, { useState, useEffect } from 'react';
import { Edit2, Check, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { GameState, Throw } from '../types';

interface Props {
  state: GameState;
  updateState: (updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => void;
}

export default function Play({ state, updateState }: Props) {
  const [pointsInput, setPointsInput] = useState('');
  const [editingThrowId, setEditingThrowId] = useState<string | null>(null);
  const [editPointsValue, setEditPointsValue] = useState('');

  useEffect(() => {
    if (!state.currentTurn && state.teams.length > 0) {
      // Randomly select starting team
      const startTeamIndex = Math.floor(Math.random() * state.teams.length);
      const startTeam = state.teams[startTeamIndex];
      // Select first player (or random)
      const startPlayerId = startTeam.playerIds[0];
      
      updateState({
        currentTurn: { teamId: startTeam.id, playerId: startPlayerId }
      });
    }
  }, [state.currentTurn, state.teams, updateState]);

  if (!state.currentTurn || state.teams.length === 0) {
    return <div className="text-center p-6 text-slate-500">Please set up teams first.</div>;
  }

  const currentTeam = state.teams.find(t => t.id === state.currentTurn!.teamId);
  const currentPlayer = state.players.find(p => p.id === state.currentTurn!.playerId);

  const teamScores = state.teams.map(team => {
    const total = state.throws.filter(t => t.teamId === team.id).reduce((sum, t) => sum + t.points, 0);
    const count = state.throws.filter(t => t.teamId === team.id).length;
    return { ...team, total, count };
  });

  const isRoundComplete = state.throws.length > 0 && new Set(teamScores.map(t => t.count)).size === 1;

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(pointsInput, 10);
    if (isNaN(points)) return;

    const newThrow: Throw = {
      id: crypto.randomUUID(),
      teamId: currentTeam!.id,
      playerId: currentPlayer!.id,
      points,
      timestamp: Date.now()
    };

    updateState(prev => {
      const newThrows = [newThrow, ...prev.throws]; // Add to front for history
      
      // Calculate next turn
      const currentTeamIdx = prev.teams.findIndex(t => t.id === currentTeam!.id);
      const nextTeamIdx = (currentTeamIdx + 1) % prev.teams.length;
      const nextTeam = prev.teams[nextTeamIdx];
      
      // Find how many throws the next team has made to determine which player is next
      const nextTeamThrows = newThrows.filter(t => t.teamId === nextTeam.id).length;
      const nextPlayerId = nextTeam.playerIds[nextTeamThrows % nextTeam.playerIds.length];

      return {
        throws: newThrows,
        currentTurn: { teamId: nextTeam.id, playerId: nextPlayerId }
      };
    });

    setPointsInput('');
  };

  const handleEditSave = (throwId: string) => {
    const points = parseInt(editPointsValue, 10);
    if (!isNaN(points)) {
      updateState(prev => ({
        throws: prev.throws.map(t => t.id === throwId ? { ...t, points } : t)
      }));
    }
    setEditingThrowId(null);
  };

  const finishRound = () => {
    if (!isRoundComplete) return;
    
    // Find team(s) with lowest score
    const minScore = Math.min(...teamScores.map(t => t.total));
    const winnerIds = teamScores.filter(t => t.total === minScore).map(t => t.id);

    updateState(prev => {
      const newRoundWins = { ...prev.roundWins };
      winnerIds.forEach(id => {
        newRoundWins[id] = (newRoundWins[id] || 0) + 1;
      });
      return {
        roundWins: newRoundWins,
        phase: 'summary'
      };
    });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Live Match Card */}
      <section className="bg-brand-dark text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <h2 className="text-sm text-emerald-400 font-bold mb-4 uppercase tracking-wider">Live Match</h2>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {teamScores.map(team => (
            <div key={team.id} className={`p-3 rounded-xl border ${currentTeam?.id === team.id ? 'border-brand-mint bg-white/10' : 'border-white/10 bg-black/20'}`}>
              <div className="text-xs text-slate-300 mb-1 truncate">{team.name}</div>
              <div className="text-2xl font-bold text-white">{team.total}</div>
              <div className="text-[10px] text-emerald-500 mt-1">{team.count} throws</div>
            </div>
          ))}
        </div>
      </section>

      {/* Input Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="mb-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Up Next</p>
          <h3 className="text-xl font-bold text-brand-dark">{currentPlayer?.name}</h3>
          <p className="text-sm text-brand-accent font-medium">{currentTeam?.name}</p>
        </div>

        <form onSubmit={handleScoreSubmit} className="flex flex-col items-center">
          <input
            type="number"
            value={pointsInput}
            onChange={(e) => setPointsInput(e.target.value)}
            className="w-32 h-24 text-center text-4xl font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/20 outline-none transition-all"
            placeholder="0"
            autoFocus
          />
          <button
            type="submit"
            disabled={!pointsInput}
            className="mt-6 w-full bg-brand-accent text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-md shadow-brand-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Points <ArrowRight size={20} />
          </button>
        </form>
      </section>

      {/* History Log */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-md font-bold text-slate-800 mb-4">Recent Throws</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {state.throws.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No throws yet.</p>
          ) : (
            state.throws.map(th => {
              const p = state.players.find(x => x.id === th.playerId);
              const t = state.teams.find(x => x.id === th.teamId);
              const isEditing = editingThrowId === th.id;

              return (
                <div key={th.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{p?.name}</p>
                    <p className="text-xs text-slate-500">{t?.name}</p>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editPointsValue}
                        onChange={(e) => setEditPointsValue(e.target.value)}
                        className="w-16 text-center border border-brand-accent rounded p-1 font-bold"
                        autoFocus
                      />
                      <button onClick={() => handleEditSave(th.id)} className="p-1.5 bg-brand-accent text-white rounded hover:bg-emerald-600">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-brand-dark w-8 text-right">{th.points}</span>
                      <button
                        onClick={() => { setEditingThrowId(th.id); setEditPointsValue(th.points.toString()); }}
                        className="text-slate-400 hover:text-brand-accent p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Finish Round Button */}
      <button
        onClick={finishRound}
        disabled={!isRoundComplete}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          isRoundComplete
            ? 'bg-brand-dark text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-900'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 size={20} />
        Finish Round
      </button>
    </div>
  );
}