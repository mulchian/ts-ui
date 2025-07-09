import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../../../features/office/services/employee.service';
import { Employee } from '../../../core/model/employee';
import { Job } from '../../../core/model/job';
import { TeamService } from '../../../core/services/team.service';
import { first, Observable } from 'rxjs';
import { Team } from '../../../core/model/team';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../loading/loading.service';

@Component({
  selector: 'app-contract-modal',
  templateUrl: './contract-modal.component.html',
  styleUrls: ['./contract-modal.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatGridListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  providers: [EmployeeService],
})
export class ContractModalComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<ContractModalComponent>>(MatDialogRef);
  job: Job;
  employee: Employee;
  newEmployee = true;
  signingBonus = 0;
  newMoral = 1;
  totalOffer = 0;
  timeOfContract = '3';
  newSalary = 1;
  minSalary = 1;
  maxSalary = 1;
  salaryStep = 1;
  isLoading = true;
  private readonly loadingService = inject(LoadingService);
  private readonly teamService = inject(TeamService);
  private readonly employeeService = inject(EmployeeService);

  constructor() {
    const data = inject<DialogData>(MAT_DIALOG_DATA);

    this.job = data.job;
    this.employee = data.employee;
    this.newEmployee = this.employee.contract == null;

    this.initContractDetails();
    this.calcContractDetails();
    this.isLoading = false;
  }

  get team$(): Observable<Team | null> {
    return this.teamService.team$;
  }

  ngOnInit() {
    console.log('init contract modal');
  }

  ngOnDestroy() {
    console.log('destroy contract modal');
  }

  negotiateContract() {
    if (Math.random() < this.calcProbability()) {
      this.isLoading = true;
      console.log('Vertrag wird erstellt.');
      // Chance zu Moral als Prozent, um hier zu sein.
      // Ist die Moral 0,75 ist die Chance 50 %, dass wir hier landen.
      this.employeeService
        .negotiateContract(this.employee, this.timeOfContract, this.newSalary)
        .pipe(first())
        .subscribe(isNegotiated => {
          console.log('Vertrag erstellt:', isNegotiated);
          this.loadingService.loadingOn();
          // reloading when dialog is being closed
          this.onDismiss(true);
        });
    } else {
      console.log('Chance verpasst');
      this.updateSalaryRange();
    }
  }

  changeSalary() {
    this.calcContractDetails();
  }

  changeTimeOfContract() {
    this.calcContractDetails();
  }

  formatSalaryLabel(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  }

  onDismiss(reload: boolean) {
    console.log('dismiss contract modal');
    this.dialogRef.close(reload);
  }

  private updateSalaryRange() {
    const changedMoral = this.newMoral + 0.05;
    this.minSalary = Math.floor(this.maxSalary * changedMoral);
    if (this.newSalary < this.minSalary) {
      this.newMoral = this.minSalary / (this.newSalary / changedMoral);
      this.newSalary = this.minSalary;
    }
    if (this.minSalary > this.maxSalary) {
      this.minSalary = this.maxSalary;
    }
    this.newMoral = Math.round((this.newSalary / this.maxSalary) * 100) / 100;
  }

  private calcProbability() {
    let probability = 0.5;
    if (this.newMoral <= 0.8) {
      probability += this.newMoral - 0.75;
    } else if (this.newMoral < 0.9) {
      probability += 0.05 + (((this.newMoral * 100) % 10) * 2) / 100;
    } else if (this.newMoral < 0.98) {
      probability += 0.26 + (((this.newMoral * 100) % 10) * 3) / 100;
    } else {
      probability = this.newMoral;
    }
    return probability;
  }

  private calcContractDetails() {
    this.signingBonus =
      Math.floor(this.employee.marketValue * (0.05 * Number(this.timeOfContract))) * Number(this.timeOfContract);
    this.totalOffer = this.newSalary + this.signingBonus;

    this.newMoral = Math.round((this.newSalary / this.maxSalary) * 100) / 100;
  }

  private initContractDetails() {
    this.newSalary = (this.employee.marketValue * 20) / 100;
    this.maxSalary = Math.floor((this.employee.marketValue * 20) / 100);
    this.minSalary = Math.floor(this.maxSalary * 0.75);
    this.salaryStep = Math.floor(this.maxSalary * 0.01);
  }
}

export interface DialogData {
  job: Job;
  employee: Employee;
}
