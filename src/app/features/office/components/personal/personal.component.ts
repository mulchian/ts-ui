import { AfterViewChecked, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgxMasonryComponent, NgxMasonryModule, NgxMasonryOptions } from 'ngx-masonry';
import { Building } from '../../../../core/model/building';
import { first, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { Employee } from '../../../../core/model/employee';
import { Job } from '../../../../core/model/job';
import { JobService } from '../../services/job.service';
import { EmployeeService } from '../../services/employee.service';
import { StadiumService } from '../../../../core/services/stadium.service';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeModalComponent } from '../../../../shared/modal/employee-modal/employee-modal.component';
import { ContractModalComponent } from '../../../../shared/modal/contract-modal/contract-modal.component';
import { NavigationEnd, Router } from '@angular/router';
import { TippyInstance } from '@ngneat/helipopper/config';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { InViewportDirective } from 'ng-in-viewport';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButton } from '@angular/material/button';
import { TippyDirective } from '@ngneat/helipopper';
import { ConfirmModalComponent } from '../../../../shared/modal/tooltip/confirm-modal/confirm-modal.component';
import { TeamService } from '../../../../core/services/team.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
  imports: [
    CommonModule,
    NgxMasonryModule,
    MatCardModule,
    MatDivider,
    MatGridListModule,
    InViewportDirective,
    MatButton,
    TippyDirective,
    ConfirmModalComponent,
  ],
  providers: [TeamService, EmployeeService, JobService, StadiumService, LoadingService],
})
export class PersonalComponent implements OnInit, AfterViewChecked, OnDestroy {
  unsubscribe = new Subject();
  @ViewChild(NgxMasonryComponent)
  masonry: NgxMasonryComponent | undefined;
  masonryOptions: NgxMasonryOptions = {
    gutter: 20,
  };
  rowHeight = '4:1';
  @ViewChild('tpRelease')
  tpRelease: TippyInstance | undefined;
  overlayRefs: OverlayRef[] = [];
  officeBuilding: Building | undefined;
  employees: Employee[] = [];
  private readonly loadingService = inject(LoadingService);
  private readonly jobService = inject(JobService);
  private readonly employeeService = inject(EmployeeService);
  private readonly stadiumService = inject(StadiumService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly navigationSubscription: Subscription;

  constructor() {
    this.navigationSubscription = this.router.events.subscribe((e: unknown) => {
      if (e instanceof NavigationEnd) {
        this.loadingService.loadingOn();
        this.ngOnInit();
        this.ngAfterViewChecked();
        setTimeout(() => {
          this.loadingService.loadingOff();
        }, 750);
      }
    });
  }

  get jobs(): Observable<Job[] | null> {
    return this.jobService.jobs$;
  }

  ngOnInit(): void {
    this.stadiumService.stadium$.pipe(takeUntil(this.unsubscribe)).subscribe(stadium => {
      if (stadium) {
        this.officeBuilding = stadium.buildings.find(building => building.name === 'Bürogebäude');
      }
    });
    this.employeeService.employees$.pipe(takeUntil(this.unsubscribe)).subscribe(employees => {
      if (employees) {
        this.employees = employees;
      }
    });

    this.rowHeight = window.innerWidth <= 1150 ? '3:1' : '4:1';
  }

  ngOnDestroy(): void {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  ngAfterViewChecked() {
    if (this.masonry) {
      this.masonry.reloadItems();
      this.masonry.layout();
    }
    if (this.officeBuilding) {
      this.onMasonryComplete();
    }
  }

  onResize(event: Event) {
    this.rowHeight = (<Window>event.target)?.innerWidth <= 1150 ? '2:1' : '4:1';
  }

  onViewportAction({ target, visible }: { target: Element; visible: boolean }) {
    if (visible) {
      const overlayRef = this.loadingService.loadingOnInOverlay(<HTMLElement>target);
      this.overlayRefs.push(overlayRef);
    }
  }

  onMasonryComplete() {
    if (this.overlayRefs.length > 0) {
      this.overlayRefs.forEach(overlayRef => {
        this.loadingService.loadingOffInOverlay(overlayRef);
      });
      this.overlayRefs = [];
    }
  }

  getEmployeeForJob(job: Job): Employee | undefined {
    return this.employees.find(employee => employee != null && employee.job.id === job.id);
  }

  hasFreePositions(): boolean {
    if (this.employees && this.officeBuilding) {
      return this.officeBuilding.level > this.employees.length;
    }
    return false;
  }

  calcEmployeeSalary(): number {
    let teamSalary = 0;

    this.employees.forEach(employee => {
      teamSalary += employee.contract?.salary || 0;
    });

    return teamSalary;
  }

  releaseEmployee(employee: Employee) {
    console.log('Release employee in Promise', employee);
    this.employeeService
      .releaseEmployee(employee)
      .pipe(first())
      .subscribe(isReleased => {
        if (isReleased) {
          this.router.navigateByUrl(this.router.url);
        } else {
          console.log('Error on release employee');
        }
        this.tpRelease?.hide();
      });
  }

  openEmployeeDialog(job: Job) {
    console.log('Open employee dialog for', job);
    this.dialog.open(EmployeeModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      exitAnimationDuration: 0,
      minWidth: '50vw',
      data: {
        job,
      },
    });
  }

  openContractDialog(employee: Employee) {
    console.log('Open contract dialog for ', employee);
    this.dialog.open(ContractModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      exitAnimationDuration: 0,
      minWidth: '50vw',
      data: {
        employee,
        job: employee.job,
      },
    });
  }
}
