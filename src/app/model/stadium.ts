import { Building } from './building';

export interface Stadium {
  id: number;
  name: string;
  description: string;
  buildings: Building[];
}
