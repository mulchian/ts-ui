import { Moment } from 'moment';

export interface Booking {
  id: number;
  idTeam: number;
  bookingTime: Moment;
  direction: 'credit' | 'debit';
  amount: number;
  currency: 'EUR' | 'COINS';
  account: 'budget' | 'salarycap' | 'coins';
  category:
    | 'construction'
    | 'maintenance'
    | 'ticket'
    | 'sponsor'
    | 'wages'
    | 'contract'
    | 'transfer'
    | 'scouting'
    | 'bet'
    | 'loan'
    | 'interest'
    | 'refund'
    | 'admin'
    | 'other';
  refType: 'stand' | 'building' | 'player' | 'employee' | 'league' | 'friendly' | 'bank' | 'system' | 'other';
  refId: number;
  note: string;
}
