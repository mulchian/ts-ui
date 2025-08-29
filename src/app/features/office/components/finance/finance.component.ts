import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { FinanceDay, FinanceSummary } from '../../../../core/model/finance';
import { Subject, takeUntil } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { Booking } from '../../../../core/model/booking';
import moment from 'moment-timezone';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { TranslatePipe } from '../../../../shared/pipe/translate.pipe';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss',
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatCardModule,
    MatDivider,
    MatTableModule,
    MatSort,
    MatSortHeader,
    MatSort,
    TranslatePipe,
  ],
  providers: [FinanceService],
})
export class FinanceComponent implements OnInit {
  readonly financeSummary = signal<FinanceSummary | null>(null);
  readonly daysToShow = signal(7);
  readonly accountToShow = signal<'budget' | 'salarycap' | 'coins'>('budget');

  days = signal<FinanceDay[]>([]);
  readonly minNet = computed(() => Math.min(...this.days().map(d => d.net), 0));
  readonly maxNet = computed(() => Math.max(...this.days().map(d => d.net), 0));

  readonly polylinePoints = computed(() => {
    const days = this.days();
    if (!days.length) return '';
    const w = 520,
      h = 200,
      pad = 8;
    const min = this.minNet(),
      max = this.maxNet() || 1;
    const range = max - min || 1;
    const stepX = (w - pad * 2) / (days.length - 1);
    const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
    return days.map((d, i) => `${pad + i * stepX},${y(d.net)}`).join(' ');
  });

  displayedColumns: string[] = ['time', 'category', 'note', 'amount'];
  bookings = new MatTableDataSource<Booking>();

  private readonly unsubscribe$ = new Subject<void>();
  private readonly loadingService = inject(LoadingService);
  private readonly financeService = inject(FinanceService);

  ngOnInit() {
    this.loadingService.loadingOn();
    this.financeService.summary$.pipe(takeUntil(this.unsubscribe$)).subscribe(summary => {
      this.financeSummary.set(summary);
      if (summary) {
        this.bookings.data = summary.bookings;
        this.calcDaysFromBookings(summary.bookings, this.daysToShow());
      }
      this.loadingService.loadingOff();
    });
  }

  reload() {
    this.loadingService.loadingOn();
    this.financeSummary.set(null);
    this.financeService.updateFinanceSummary();
  }

  applyFilter() {
    this.bookings.filter = this.accountToShow().trim().toLowerCase();
  }

  netClass(v: number): string {
    return v >= 0 ? 'pos' : 'neg';
  }

  getTicketSales(eventType: 'league' | 'friendly') {
    return (this.financeSummary()?.bookings ?? [])
      .filter(b => b.category === 'ticket' && b.refType === eventType)
      .map(b => b.amount)
      .reduce((a, b) => a + b, 0);
  }

  calcSponsorFinances() {
    return (this.financeSummary()?.bookings ?? [])
      .filter(b => b.category === 'sponsor' && b.direction === 'credit')
      .map(b => b.amount)
      .reduce((a, b) => a + b, 0);
  }

  calcLoanFinances(direction: 'debit' | 'credit', category: 'loan' | 'interest' = 'loan') {
    return (this.financeSummary()?.bookings ?? [])
      .filter(b => b.category === category && b.refType === 'bank' && b.direction === direction)
      .map(b => b.amount)
      .reduce((a, b) => a + b, 0);
  }

  calcBetFinances(direction: 'debit' | 'credit') {
    return (this.financeSummary()?.bookings ?? [])
      .filter(b => b.category === 'bet' && b.direction === direction)
      .map(b => b.amount)
      .reduce((a, b) => a + b, 0);
  }

  calcStadiumCosts(
    category: 'maintenance' | 'construction',
    type: 'stand' | 'building',
    direction: 'debit' | 'credit'
  ) {
    return (this.financeSummary()?.bookings ?? [])
      .filter(b => b.category === category && b.refType === type && b.direction === direction)
      .map(b => b.amount)
      .reduce((a, b) => a + b, 0);
  }

  calcScoutingCosts() {
    return (this.financeSummary()?.bookings ?? [])
      .filter(b => b.category === 'scouting' && b.direction === 'debit')
      .map(b => b.amount)
      .reduce((a, b) => a + b, 0);
  }

  sortBookings(sort: Sort) {
    const data = this.bookings.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortBookings({ active: 'time', direction: 'asc' });
      return;
    }

    this.bookings.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'account':
          return this.compare(a.account, b.account, isAsc);
        case 'time':
          return this.compareTime(a.bookingTime, b.bookingTime, isAsc);
        case 'category':
          return this.compare(a.category, b.category, isAsc);
        case 'note':
          return this.compare(a.note, b.note, isAsc);
        case 'amount':
          return this.compare(a.amount, b.amount, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  private compareTime(a: moment.Moment, b: moment.Moment, isAsc: boolean) {
    return (a.isBefore(b) ? -1 : 1) * (isAsc ? 1 : -1);
  }

  private calcDaysFromBookings(bookings: Booking[], rangeDays: number = this.daysToShow()) {
    const financeStartDay = this.financeSummary()?.financeStartDay;
    if (financeStartDay) {
      const daysSinceStart = moment().diff(financeStartDay, 'days') + 1;
      rangeDays = Math.min(rangeDays, daysSinceStart);
    }
    const today = moment().tz('Europe/Berlin');
    const keys: string[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const day = today.clone().subtract(i, 'days');
      keys.push(day.format('YYYY-MM-DD'));
    }

    const map = new Map<string, FinanceDay>();
    keys.forEach(k => map.set(k, { date: k, income: 0, expense: 0, net: 0 }));

    for (const booking of bookings) {
      const key = booking.bookingTime.format('YYYY-MM-DD');
      if (!map.has(key)) continue;

      const day = map.get(key)!;
      if (booking.direction === 'credit') {
        day.income += booking.amount;
        day.net += booking.amount;
      } else {
        day.expense += booking.amount;
        day.net -= booking.amount;
      }
    }

    this.days.set(Array.from(map.values()));
  }
}
