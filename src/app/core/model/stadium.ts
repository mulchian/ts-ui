import { Building } from './building';
import { Stand } from './stand';

export interface Stadium {
  id: number;
  name: string;
  description: string;
  stands: Stand[];
  buildings: Building[];
}
