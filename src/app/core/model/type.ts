import { Position } from './position';

export interface Type {
  id: number;
  position: Position;
  description: string;
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
  assignedTeamPart: string;
}
