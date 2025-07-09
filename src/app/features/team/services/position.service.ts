import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Position } from '../../../core/model/position';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';

@Injectable()
export class PositionService {
  POSITION_URL = '/api/position';
  private subject = new BehaviorSubject<Position[] | null>(null);
  positions$: Observable<Position[] | null> = this.subject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllPositions();
  }

  private loadAllPositions() {
    this.http
      .get<Position[]>(this.POSITION_URL + '/getAllPositions.php')
      .pipe(shareReplay())
      .subscribe(positions => {
        this.subject.next(positions);
      });
  }
}
