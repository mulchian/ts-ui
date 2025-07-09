import { League } from './league';

export interface DraftPosition {
  id: number;
  season: number;
  round: number | null;
  pick: number | null;
  drafted: boolean;
  league: League;
}
