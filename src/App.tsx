import { Settings, PlayCircle, Trophy } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import Setup from './components/Setup';
import Play from './components/Play';
import Summary from './components/Summary';

function App() {
  const { state, updateState } = useGameState();

  const steps = [
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'play', label: 'Play', icon: PlayCircle },
    { id: 'summary', label: 'Leaderboard', icon: Trophy },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto bg-brand-slate shadow-2xl relative">
      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {state.phase === 'setup' && <Setup state={state} updateState={updateState} />}
        {state.phase === 'play' && <Play state={state} updateState={updateState} />}
        {state.phase === 'summary' && <Summary state={state} updateState={updateState} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center pb-safe z-50">
        {steps.map((step) => {
          const isActive = state.phase === step.id;
          return (
            <button
              key={step.id}
              onClick={() => updateState({ phase: step.id })}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <step.icon size={24} className={isActive ? 'mb-1' : 'mb-1 opacity-70'} />
              <span className={`text-[10px] font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{step.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;