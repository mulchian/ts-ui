import { Contract } from './contract';
import { Job } from './job';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  ovr: number;
  talent: number;
  experience: number;
  morale: number;
  unemployedSeasons: number;
  marketValue: number;
  idTeam: number | null;
  job: Job;
  contract: Contract | null;
}
