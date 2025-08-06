import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, debounceTime, first, Observable, Subject, takeUntil } from 'rxjs';
import { Employee } from '../../../core/model/employee';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../core/services/auth.store';
import { User } from '../../../core/model/user';
import { TeamService } from '../../../core/services/team.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class EmployeeService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStore);
  private readonly teamService = inject(TeamService);

  private subject = new BehaviorSubject<Employee[] | null>(null);
  employees$: Observable<Employee[] | null> = this.subject.asObservable();

  unsubscribe$ = new Subject<void>();

  constructor() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadEmployees(user);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  negotiateContract(employee: Employee, timeOfContract: string, newSalary: number) {
    return this.http
      .post<{ isNegotiated: boolean; error?: string }>('/api/employee' + '/negotiateContract.php', {
        employeeId: employee.id,
        timeOfContract,
        newSalary,
      })
      .pipe(
        first(),
        tap(data => {
          if (data.isNegotiated) {
            // we need to add Employee to subject
            this.teamService.updateTeam();
            this.loadEmployees(null);
          } else if (data.error) {
            console.error('Error negotiating contract:', data.error);
            throw new Error(data.error);
          }
        })
      );
  }

  releaseEmployee(employee: Employee) {
    return this.http.post<{ isReleased: boolean; error?: string }>('/api/employee' + '/releaseEmployee.php', {
      employeeId: employee.id,
      jobName: employee.job.name,
    });
  }

  loadEmployeesForTeam() {
    this.loadEmployees(null);
  }

  private loadEmployees(user: User | null) {
    // first get team (TeamService) and check if there are employees
    // second get employees directly from database
    this.teamService.team$.pipe(debounceTime(250), takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team) {
        console.log('Employees fetched from team.', team.employees.length);
        this.subject.next(team.employees);
        // reloadCurrentRoute(this.router);
      } else if (user) {
        this.http
          .get<Employee[]>('/api/employee' + '/getEmployees.php', {
            params: {
              userId: user.id,
            },
          })
          .pipe(first())
          .subscribe(employees => {
            if (employees) {
              console.log('Employees fetched from service.');
              this.subject.next(employees);
              // reloadCurrentRoute(this.router);
            } else {
              // PHP is sending an error message instead of a user-object
              throw new Error(JSON.stringify(user));
            }
          });
      }
    });
  }

  getUnemployedEmployees(jobName: string): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employee' + '/getUnemployedEmployees.php', {
      params: {
        jobName: jobName,
      },
    });
  }
}
