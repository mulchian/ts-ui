import { Moment } from 'moment';

export interface GameEvent {
  id: string;
  gameTime: Moment;
  gameday: string | null;
  home: string;
  away: string;
  homeAccepted: boolean;
  awayAccepted: boolean;
  result: string | null;
}
