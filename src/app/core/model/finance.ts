import { Booking } from './booking';
import { Moment } from 'moment';

export type Currency = 'EUR' | 'COINS';

export interface FinanceDay {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface FinanceTotals {
  income: number;
  expense: number;
  net: number;
  carryOver: number;
  currentBalance: number;
  currency: Currency;
}

export interface FinanceSummary {
  financeStartDay: Moment;
  bookings: Booking[];
  totals: FinanceTotals;
}
