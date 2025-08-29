import { Moment } from 'moment';

export interface Stand {
  id: number;
  name: string;
  position: StandPosition;
  capacity: number;
  maxCapacity: number;
  ticketPrice: number;
  minTicketPrice: number;
  maxTicketPrice: number;
  upgradePricePerSeat: number;
  upgradeTime: Moment | null;
  upgradeAmount: number;
  // these properties are used for the UI to show the countdown for the upgrade
  intervalId: any | undefined;
  remainingTime: string | undefined;
}

export enum StandPosition {
  // 'North' | 'South' | 'East' | 'West' | 'Northwest' | 'Northeast' | 'Southwest' | 'Southeast'
  North = 'North',
  South = 'South',
  East = 'East',
  West = 'West',
  Northwest = 'Northwest',
  Northeast = 'Northeast',
  Southwest = 'Southwest',
  Southeast = 'Southeast',
}
