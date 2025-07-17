import { Player } from './player';

export interface PositionPlayers {
  position: Position;
  players: Player[];
}

export interface Position {
  positon: string;
  description: string;
  countStarters: number;
  countBackups: number;
  countPlayers: number;
}
