import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Job } from '../../../model/job';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class JobService {
  private subject = new BehaviorSubject<Job[] | null>(null);
  jobs$: Observable<Job[] | null> = this.subject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.loadJobs();
  }

  private loadJobs() {
    this.http
      .get<Job[]>('/api/job' + '/getJobs.php')
      .pipe(shareReplay())
      .subscribe(jobs => {
        this.subject.next(jobs);
      });
  }
}
