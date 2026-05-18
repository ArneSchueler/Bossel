import React, { useState } from 'react';
import { Plus, Minus, X, Shuffle, Edit2, Play } from 'lucide-react';
import type { GameState, Player, Team } from '../types';

const ADJECTIVES = ['Hungry', 'Flying', 'Horny', 'Sweaty', 'Drunk', 'Salty', 'Greasy', 'Shaved', 'Moist', 'Slippery', 'Thirsty', 'Rowdy', 'Naughty', 'Chubby', 'Kinky', 'Filthy', 'Clumsy', 'Gassy', 'Sticky', 'Itchy', 'Screaming', 'Throbbing', 'Naked', 'Smelly', 'Juicy', 'Gigantic', 'Tiny', 'Hard', 'Soft', 'Fluffy', 'Grumpy', 'Horrible', 'Lusty', 'Brazen', 'Tipsy', 'Wasted', 'Brapless', 'Panting', 'Giggly', 'Drunken', 'Fierce', 'Sloppy', 'Dirty', 'Shiny', 'Spiky', 'Wobbling', 'Rigid', 'Limp', 'Fierce', 'Wild', 'Raw', 'Cooked', 'Burnt', 'Spicy', 'Creamy', 'Rubbery', 'Wet', 'Dry', 'Loaded', 'Wired', 'Psycho', 'Creepy', 'Nerdy', 'Funky', 'Groovy', 'Jazzy', 'Bossy', 'Trashy', 'Classy', 'Sassy', 'Trashy', 'Fancy', 'Petty', 'Messy', 'Jazzy', 'Loopy', 'Dizzy', 'Trippy', 'Psycho', 'Savage', 'Brutal', 'Wicked', 'Divine', 'Toxic', 'Bitter', 'Sweet', 'Sour', 'Salty', 'Crispy', 'Crunchy', 'Saggy', 'Perky', 'Firm', 'Loose', 'Tight', 'Deep', 'Shallow', 'Fat', 'Skinny', 'Chunky'];

const NOUNS = ['Banana', 'Cat', 'Car', 'Potato', 'Bossler', 'Cucumber', 'Sausage', 'Meatball', 'Unicorn', 'Eggplant', 'Pickle', 'Muffin', 'Cupcake', 'Beaver', 'Rooster', 'Donkey', 'Monkey', 'Sausage', 'Taco', 'Burrito', 'Peach', 'Melon', 'Cherry', 'Nut', 'Sack', 'Ball', 'Stick', 'Tool', 'Hammer', 'Knob', 'Joystick', 'Rocket', 'Submarine', 'Bush', 'Carpet', 'Curtain', 'Snake', 'Worm', 'Eel', 'Sausage', 'Wiener', 'Frank', 'Bratwurst', 'Salami', 'Noodle', 'Meatloaf', 'Biscuit', 'Cracker', 'Cookie', 'Pancake', 'Waffle', 'Donut', 'Bagel', 'Pickle', 'Olive', 'Mushroom', 'Pepper', 'Chili', 'Onion', 'Garlic', 'Potato', 'Tomato', 'Pumpkin', 'Squash', 'Carrot', 'Broccoli', 'Cabbage', 'Lettuce', 'Spinach', 'Kale', 'Spatula', 'Whisk', 'Bucket', 'Mop', 'Sponge', 'Brush', 'Soap', 'Towel', 'Pillow', 'Blanket', 'Goblin', 'Troll', 'Dwarf', 'Giant', 'Fairy', 'Witch', 'Wizard', 'Dragon', 'Pirate', 'Ninja', 'Cowboy', 'Robot', 'Alien', 'Zombie', 'Ghost', 'Clown', 'Panda', 'Koala', 'Sloth', 'Hippo'];

interface Props {
  state: GameState;
  updateState: (updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => void;
}

export default function Setup({ state, updateState }: Props) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = { id: crypto.randomUUID(), name: newPlayerName.trim() };
    updateState(prev => ({ players: [...prev.players, newPlayer] }));
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    updateState(prev => ({
      players: prev.players.filter(p => p.id !== id),
      teams: [] // Reset teams if players change
    }));
  };

  const generateUniqueName = (usedNames: Set<string> = new Set()) => {
    let name: string;
    do {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      name = `${adj} ${noun}`;
    } while (usedNames.has(name) || state.teams.some(t => t.name === name));
    return name;
  };

  const randomizeTeams = () => {
    const shuffled = [...state.players].sort(() => Math.random() - 0.5);
    const usedNames = new Set<string>();

    const newTeams: Team[] = Array.from({ length: state.teamCount }).map(() => {
      const name = generateUniqueName(usedNames);
      usedNames.add(name);
      return {
        id: crypto.randomUUID(),
        name: name,
        playerIds: []
      };
    });

    shuffled.forEach((player, i) => {
      newTeams[i % state.teamCount].playerIds.push(player.id);
    });

    updateState({ teams: newTeams, currentTurn: null });
  };

  const randomizeTeamName = (teamId: string) => {
    const newName = generateUniqueName();
    if (editingTeam === teamId) {
       setTeamNameInput(newName);
    } else {
       updateState(prev => ({
         teams: prev.teams.map(t => t.id === teamId ? { ...t, name: newName } : t)
       }));
    }
  };

  const saveTeamName = (teamId: string) => {
    if (!teamNameInput.trim()) {
      setEditingTeam(null);
      return;
    }
    updateState(prev => ({
      teams: prev.teams.map(t => t.id === teamId ? { ...t, name: teamNameInput.trim() } : t)
    }));
    setEditingTeam(null);
  };

  const startGame = () => {
    updateState({ phase: 'play' });
  };

  const canStartGame = state.teams.length > 0 && state.teams.every(t => t.playerIds.length > 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Players Section */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Players</h2>
        <form onSubmit={addPlayer} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
          <button type="submit" className="bg-brand-dark text-white p-2 px-4 rounded-xl hover:bg-emerald-900 transition-colors flex items-center justify-center">
            <Plus size={20} />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {state.players.map(player => (
            <div key={player.id} className="bg-brand-mint/30 text-brand-dark px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
              {player.name}
              <button onClick={() => removePlayer(player.id)} className="text-emerald-700 hover:text-brand-dark">
                <X size={14} />
              </button>
            </div>
          ))}
          {state.players.length === 0 && <p className="text-slate-400 text-sm">No players added yet.</p>}
        </div>
      </section>

      {/* Teams Configuration */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Team Setup</h2>
          <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => updateState(prev => ({ teamCount: Math.max(2, prev.teamCount - 1) }))}
              className="p-1.5 bg-white rounded-lg shadow-sm text-slate-600 hover:text-brand-dark disabled:opacity-50"
              disabled={state.teamCount <= 2}
            >
              <Minus size={16} />
            </button>
            <span className="font-bold w-4 text-center">{state.teamCount}</span>
            <button
              onClick={() => updateState(prev => ({ teamCount: Math.min(prev.players.length, prev.teamCount + 1) }))}
              className="p-1.5 bg-white rounded-lg shadow-sm text-slate-600 hover:text-brand-dark disabled:opacity-50"
              disabled={state.teamCount >= state.players.length || state.players.length === 0}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={randomizeTeams}
          disabled={state.players.length < 2}
          className="w-full bg-brand-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-accent/20"
        >
          <Shuffle size={20} />
          Randomize Teams
        </button>

        {state.teams.length > 0 && (
          <div className="mt-6 space-y-3">
            {state.teams.map(team => (
              <div key={team.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  {editingTeam === team.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={teamNameInput}
                        onChange={(e) => setTeamNameInput(e.target.value)}
                        className="flex-1 bg-white border border-brand-accent rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveTeamName(team.id)}
                      />
                      <button type="button" onClick={() => randomizeTeamName(team.id)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center transition-colors" title="Randomize Name">
                        <Shuffle size={14} />
                      </button>
                      <button onClick={() => saveTeamName(team.id)} className="bg-brand-accent text-white px-2 py-1 rounded text-xs font-bold">Save</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-brand-dark">{team.name}</h3>
                      <button
                        onClick={() => { setEditingTeam(team.id); setTeamNameInput(team.name); }}
                        className="text-slate-400 hover:text-brand-accent"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <span className="text-xs font-medium bg-white px-2 py-1 rounded-md text-slate-500 shadow-sm">{team.playerIds.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.playerIds.map(pid => {
                    const p = state.players.find(x => x.id === pid);
                    return p ? <span key={pid} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">{p.name}</span> : null;
                  })}
                </div>
              </div>
            ))}
            
            <button
              onClick={startGame}
              disabled={!canStartGame}
              className="mt-6 w-full bg-brand-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Play fill="currentColor" size={20} />
              Start Game
            </button>
          </div>
        )}
      </section>
    </div>
  );
}