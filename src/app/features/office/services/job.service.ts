import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { Job } from '../../../core/model/job';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';

@Injectable()
export class JobService {
  private readonly http = inject(HttpClient);

  private subject = new BehaviorSubject<Job[] | null>(null);
  jobs$: Observable<Job[] | null> = this.subject.asObservable();

  constructor() {
    this.loadJobs();
  }

  private loadJobs() {
    this.http
      .get<Job[]>('/api/job' + '/getJobs.php')
      .pipe(first(), shareReplay())
      .subscribe(jobs => {
        this.subject.next(jobs);
      });
  }
}
