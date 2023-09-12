import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { TeamService } from '../../../../team/services/team.service';
import { Building } from '../../../../model/building';
import { find, Observable, of } from 'rxjs';
import { Employee } from '../../../../model/employee';
import { Job } from '../../../../model/job';
import { JobService } from '../../services/job.service';
import { EmployeeService } from '../../services/employee.service';
import { Team } from '../../../../model/team';
import { StadiumService } from '../../services/stadium.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent implements OnInit {
  @ViewChild(NgxMasonryComponent)
  masonry: NgxMasonryComponent | undefined;

  officeBuilding: Building | undefined;
  employees$: Observable<Employee[] | null> = of(null);
  masonryOptions: NgxMasonryOptions = {
    gutter: 20,
  };

  constructor(
    private readonly jobService: JobService,
    private readonly teamService: TeamService,
    private readonly employeeService: EmployeeService,
    private readonly stadiumService: StadiumService
  ) {
    this.stadiumService.stadium$.subscribe(stadium => {
      if (stadium) {
        this.officeBuilding = stadium.buildings.find(
          building => building.name === 'Bürogebäude'
        );
      }
    });
  }

  ngOnInit(): void {
    console.log('Team', this.teamService.team$);
    console.log('Jobs', this.jobService.jobs$);
    if (this.masonry) {
      this.masonry.reloadItems();
      this.masonry.layout();
    }
  }

  get team(): Observable<Team | null> {
    return this.teamService.team$;
  }

  get jobs(): Observable<Job[] | null> {
    return this.jobService.jobs$;
  }

  hasEmployeeForJob(job: Job): Observable<boolean> {
    this.employees$
      .pipe(
        find(
          employees =>
            employees != null &&
            employees.some(employee => employee.job.id === job.id)
        )
      )
      .subscribe(employees => {
        if (employees) {
          return of(true);
        }
        return of(false);
      });
    return of(false);
  }

  hasFreePositions(): Observable<boolean> {
    let hasFreePositions = false;

    this.employees$.subscribe(employees => {
      if (employees && this.officeBuilding) {
        return (hasFreePositions =
          this.officeBuilding.level > employees.length);
      }
      return false;
    });

    return of(hasFreePositions);
  }
}
