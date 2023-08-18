import { Fanbase } from './fanbase';
import { User } from './user';
import { Stadium } from './stadium';
import { League } from './league';
import { Player } from './player';
import { Employee } from './employee';
import { Conference } from './conference';
import { Division } from './division';
import { Coaching } from './coaching';

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  budget: number;
  salaryCap: number;
  credits: number;
  chemie: number;
  gameplanOff: number;
  gameplanDef: number;
  lineupOff: string;
  lineupDef: string;
  fanbase: Fanbase | null;
  user: User;
  stadium: Stadium;
  players: Player[];
  employees: Employee[];
  league: League;
  conference: Conference;
  division: Division;
  coachings: Coaching[];
  coachingNames: string[] | null;
  teamPicture: [] | null;
  statistics: [];
  ovr: number;
}
