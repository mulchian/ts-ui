import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, debounceTime, Observable } from 'rxjs';
import { Employee } from '../../../core/model/employee';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../core/services/auth.store';
import { User } from '../../../core/model/user';
import { TeamService } from '../../../core/services/team.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStore);
  private readonly teamService = inject(TeamService);

  private subject = new BehaviorSubject<Employee[] | null>(null);
  employees$: Observable<Employee[] | null> = this.subject.asObservable();

  constructor() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadEmployees(user);
      }
    });
  }

  negotiateContract(employee: Employee, timeOfContract: string, newSalary: number) {
    return this.http
      .post('/api/employee' + '/negotiateContract.php', {
        employeeId: employee.id,
        timeOfContract,
        newSalary,
      })
      .pipe(
        tap(isNegotiated => {
          if (isNegotiated) {
            // we need to add Employee to subject
            this.teamService.updateTeam();
            this.loadEmployees(null);
          }
        }),
        catchError(error => {
          throw new Error(JSON.stringify(error));
        })
      );
  }

  releaseEmployee(employee: Employee) {
    return this.http
      .post('/api/employee' + '/releaseEmployee.php', {
        employeeId: employee.id,
        jobName: employee.job.name,
      })
      .pipe(
        tap(data => {
          console.log(JSON.stringify(data));
          const isReleased = data as boolean;
          if (isReleased) {
            // we need to clean Employee from our Subject
            this.teamService.updateTeam();
            this.loadEmployees(null);
          }
        }),
        catchError(error => {
          throw new Error(JSON.stringify(error));
        })
      );
  }

  private loadEmployees(user: User | null) {
    // first get team (TeamService) and check if there are employees
    // second get employees directly from database
    this.teamService.team$.pipe(debounceTime(500)).subscribe(team => {
      if (team) {
        console.log('{} Employees fetched from team.', team.employees.length);
        this.subject.next(team.employees);
        // reloadCurrentRoute(this.router);
      } else if (user) {
        this.http
          .get<Employee[]>('/api/employee' + '/getEmployees.php', {
            params: {
              userId: user.id,
            },
          })
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
