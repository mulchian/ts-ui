// standing.ts
import { League } from './league';

export interface Standing {
  idTeam: number;
  teamName: string;
  abbr: string;
  conference: 'Conference North' | 'Conference South';
  division: 'Division North' | 'Division South' | 'Division East' | 'Division West';
  wins: number;
  losses: number;
  ties: number;
  ptsFor: number;
  ptsAgainst: number;
  rate: number; // (W + 0.5*T) / GP
  diff: number; // ptsFor - ptsAgainst
  ovr: number;

  rankConf: number;
  rankDiv: number;
  prevRankConf?: number | null;
  prevRankDiv?: number | null;
}

export interface LeagueStandings {
  league: League;
  standings: Standing[];
}
