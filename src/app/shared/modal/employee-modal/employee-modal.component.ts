import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Job } from '../../../core/model/job';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EmployeeService } from '../../../features/office/services/employee.service';
import { first } from 'rxjs';
import { ContractModalComponent } from '../contract-modal/contract-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../../core/services/team.service';
import { TalentPipe } from '../../pipe/talent.pipe';

@Component({
  selector: 'app-employee-modal',
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TalentPipe,
  ],
  providers: [TeamService, EmployeeService],
})
export class EmployeeModalComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<EmployeeModalComponent>>(MatDialogRef);
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'select',
    'jobName',
    'name',
    'age',
    'nationality',
    'talent',
    'experience',
    'ovr',
    'salary',
    'marketValue',
  ];
  dataSource = new MatTableDataSource<EmployeeTableData>();
  selection = new SelectionModel<EmployeeTableData>(false, []);
  job: Job;

  isLoading = true;

  @ViewChild(MatTable)
  employeeTable: MatTable<Element> | undefined;

  constructor() {
    const data = inject<DialogData>(MAT_DIALOG_DATA);
    this.job = data.job;
  }

  ngOnInit(): void {
    this.employeeService
      .getUnemployedEmployees(this.job.name)
      .pipe(first())
      .subscribe(employees => {
        employees.forEach(employee => {
          this.dataSource.data.push({
            id: employee.id,
            name: employee.firstName + ' ' + employee.lastName,
            age: employee.age,
            nationality: employee.nationality,
            talent: employee.talent,
            experience: employee.experience,
            ovr: employee.ovr,
            salary: Math.floor((employee.marketValue * 20) / 100),
            jobName: employee.job.name,
            marketValue: employee.marketValue,
          });
        });
        this.isLoading = false;
        this.employeeTable?.renderRows();
      });
  }

  ngOnDestroy() {
    console.log('destroy contract modal');
  }

  openContractDialogForSelectedEmployee() {
    // get selected employee from unemployed employee table - always maximum one selection
    const selectedId = this.selection.selected[0].id;
    this.employeeService
      .getUnemployedEmployees(this.job.name)
      .pipe(first())
      .subscribe(employees => {
        const selectedEmployee = employees.filter(employee => employee.id === selectedId)[0];
        console.log('Open contract dialog for', selectedEmployee);

        const dialogRef = this.dialog
          .open(ContractModalComponent, {
            backdropClass: 'cdk-overlay-transparent-backdrop',
            hasBackdrop: true,
            exitAnimationDuration: 0,
            minWidth: '50vw',
            data: {
              employee: selectedEmployee,
              job: this.job,
            },
          })
          .afterClosed()
          .subscribe((shouldReload: boolean) => {
            dialogRef.unsubscribe();
            if (shouldReload) window.location.reload();
          });
      });
  }

  onDismiss() {
    this.dialogRef.close();
  }
}

export interface DialogData {
  job: Job;
}

export interface EmployeeTableData {
  id: number;
  name: string;
  age: number;
  nationality: string;
  talent: number;
  experience: number;
  ovr: number;
  salary: number;
  jobName: string;
  marketValue: number;
}
