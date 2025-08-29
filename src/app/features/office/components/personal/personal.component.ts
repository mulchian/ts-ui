import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Building, BuildingEffect } from '../../../../core/model/building';
import { first, Observable, Subject, takeUntil } from 'rxjs';
import { Employee } from '../../../../core/model/employee';
import { Job } from '../../../../core/model/job';
import { JobService } from '../../services/job.service';
import { EmployeeService } from '../../services/employee.service';
import { StadiumService } from '../../services/stadium.service';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeModalComponent } from '../../../../shared/modal/employee-modal/employee-modal.component';
import { ContractModalComponent } from '../../../../shared/modal/contract-modal/contract-modal.component';
import { TippyInstance } from '@ngneat/helipopper/config';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButton } from '@angular/material/button';
import { TippyDirective } from '@ngneat/helipopper';
import { ConfirmModalComponent } from '../../../../shared/modal/tooltip/confirm-modal/confirm-modal.component';
import { TeamService } from '../../../../core/services/team.service';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { InViewportDirective } from 'ng-in-viewport';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatDivider,
    MatGridListModule,
    MatButton,
    TippyDirective,
    ConfirmModalComponent,
    InViewportDirective,
  ],
  providers: [TeamService, EmployeeService, JobService, StadiumService],
})
export class PersonalComponent implements OnInit, OnDestroy {
  unsubscribe = new Subject();
  @ViewChild('tpRelease')
  tpRelease: TippyInstance | undefined;
  officeBuilding: Building | undefined;
  officeEffect: BuildingEffect | undefined;
  employees: Employee[] = [];

  officeCard: HTMLElement | undefined;
  officeCardOverlayRef: OverlayRef | undefined;

  private readonly loadingService = inject(LoadingService);
  private readonly jobService = inject(JobService);
  private readonly employeeService = inject(EmployeeService);
  private readonly stadiumService = inject(StadiumService);
  private readonly teamService = inject(TeamService);
  private readonly dialog = inject(MatDialog);

  constructor() {}

  get jobs$(): Observable<Job[] | null> {
    return this.jobService.jobs$;
  }

  ngOnInit() {
    this.stadiumService.stadium$.pipe(takeUntil(this.unsubscribe)).subscribe(stadium => {
      if (stadium) {
        this.officeBuilding = stadium.buildings.find(building => building.name === 'Bürogebäude');
        const officeBuildingLevel = this.officeBuilding?.buildingLevels.find(
          bl => bl.level === this.officeBuilding?.level
        );
        this.officeEffect = officeBuildingLevel?.buildingEffects?.find(effect =>
          effect.name.startsWith('Maximale Mitarbeiter')
        );
        setTimeout(() => {
          if (this.officeCardOverlayRef) {
            this.loadingService.loadingOffInOverlay(this.officeCardOverlayRef, this.officeCard);
          }
        }, 500);
      }
    });
    this.employeeService.employees$.pipe(takeUntil(this.unsubscribe)).subscribe(employees => {
      if (employees) {
        this.employees = employees;
        setTimeout(() => {
          this.loadingService.loadingOffInOverlayForAll();
        }, 500);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  onViewportAction({ target, visible }: { target: Element; visible: boolean }) {
    if (visible) {
      const card = target.closest('mat-card') as HTMLElement;
      card.classList.add('opacity-50', 'pointer-events-none');
      this.loadingService.loadingOnInOverlay(card);
    }
  }

  onViewportActionOfficeCard({ target, visible }: { target: Element; visible: boolean }) {
    if (visible) {
      this.officeCard = target.closest('mat-card') as HTMLElement;
      this.officeCard.classList.add('opacity-50', 'pointer-events-none');
      this.officeCardOverlayRef = this.loadingService.loadingOnInOverlay(this.officeCard);
    }
  }

  getEmployeeForJob(job: Job): Employee | undefined {
    return this.employees.find(employee => employee != null && employee.job.id === job.id);
  }

  hasFreePositions(): boolean {
    if (this.employees && this.officeEffect) {
      return this.officeEffect.value > this.employees.length;
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
      .subscribe(data => {
        if (data.isReleased) {
          // we need to clean Employee from our Subject
          this.teamService.updateTeam();
          this.employeeService.loadEmployeesForTeam();
        } else if (data.error) {
          console.error('Error releasing employee:', data.error);
          throw new Error(data.error);
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
