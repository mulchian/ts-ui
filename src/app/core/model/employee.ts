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
  moral: number;
  unemployedSeasons: number;
  marketValue: number;
  salary: string;
  idTeam: number | null;
  job: Job;
  contract: Contract | null;
}
