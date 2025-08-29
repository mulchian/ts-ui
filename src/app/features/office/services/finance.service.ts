import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FinanceSummary } from '../../../core/model/finance';
import { map } from 'rxjs/operators';
import moment from 'moment-timezone';

@Injectable()
export class FinanceService {
  private readonly http = inject(HttpClient);

  private subject = new BehaviorSubject<FinanceSummary | null>(null);
  summary$: Observable<FinanceSummary | null> = this.subject.asObservable();

  constructor() {
    this.updateFinanceSummary();
  }

  updateFinanceSummary() {
    this.loadSummary();
  }

  private loadSummary() {
    this.http
      .get<FinanceSummary>('/api/finance' + '/getSummary.php')
      .pipe(
        first(),
        map(summary => {
          return {
            ...summary,
            financeStartDay: moment.tz(summary.financeStartDay, 'Europe/Berlin'),
            bookings: summary.bookings.map(booking => ({
              ...booking,
              bookingTime: moment.tz(booking.bookingTime, 'Europe/Berlin'),
            })),
          };
        })
      )
      .subscribe(summary => {
        this.subject.next(summary);
      });
  }
}
