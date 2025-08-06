import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Position } from '../../../core/model/position';
import { BehaviorSubject, first, Observable } from 'rxjs';

@Injectable()
export class PositionService {
  private http = inject(HttpClient);

  POSITION_URL = '/api/position';
  private subject = new BehaviorSubject<Position[] | null>(null);
  positions$: Observable<Position[] | null> = this.subject.asObservable();

  constructor() {
    this.loadAllPositions();
  }

  private loadAllPositions() {
    this.http
      .get<Position[]>(this.POSITION_URL + '/getAllPositions.php')
      .pipe(first())
      .subscribe(positions => {
        this.subject.next(positions);
      });
  }
}
