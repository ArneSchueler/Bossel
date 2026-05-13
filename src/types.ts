export type Player = { id: string; name: string };
export type Team = { id: string; name: string; playerIds: string[] };
export type Throw = { id: string; teamId: string; playerId: string; points: number; timestamp: number };
export type GamePhase = 'setup' | 'play' | 'summary';

export type GameState = {
  phase: GamePhase;
  players: Player[];
  teamCount: number;
  teams: Team[];
  throws: Throw[];
  roundWins: Record<string, number>;
  currentTurn: { teamId: string; playerId: string } | null;
};