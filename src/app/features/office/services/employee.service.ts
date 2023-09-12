import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../../../model/employee';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../services/auth.store';
import { User } from '../../../model/user';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private subject = new BehaviorSubject<Employee[] | null>(null);
  employees$: Observable<Employee[] | null> = this.subject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthStore
  ) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadEmployees(user);
      }
    });
  }

  private loadEmployees(user: User) {
    this.http
      .get<Employee[]>('/api/employee' + '/getEmployees.php', {
        params: {
          userId: user.id,
        },
      })
      .subscribe(employees => {
        this.subject.next(employees);
      });
  }
}
