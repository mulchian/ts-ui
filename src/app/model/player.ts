import { Type } from './type';
import { Status } from './status';
import { Character } from './character';
import { Contract } from './contract';
import { DraftPosition } from './draftposition';

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  height: number;
  weight: number;
  marketValue: number;
  energy: number;
  morale: number;
  experience: number;
  talent: number;
  skillPoints: number;
  timeInLeague: number;
  hallOfFame: boolean;
  trainingGroup: string;
  intensity: number;
  numberOfTrainings: number;
  lineupPosition: string | null;
  skills: [];
  idTeam: number | null;
  status: Status;
  character: Character;
  contract: Contract | null;
  draftPosition: DraftPosition | null;
  type: Type;
  statistics: [];
  ovr: number;
}
