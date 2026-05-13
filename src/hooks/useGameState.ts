import { useState, useEffect } from 'react';
import type { GameState } from '../types';

const INITIAL_STATE: GameState = {
  phase: 'setup',
  players: [],
  teamCount: 2,
  teams: [],
  throws: [],
  roundWins: {},
  currentTurn: null,
};

const STORAGE_KEY = 'bossel_game_state';

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => {
    setState((prev) => {
      const newValues = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...newValues };
    });
  };

  return { state, updateState };
}