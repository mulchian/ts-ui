import { NgModule } from '@angular/core';
import { PersonalComponent } from './components/personal/personal.component';
import { OfficeComponent } from './office.component';
import { OfficeRoutingModule } from './office-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FriendlyComponent } from './components/friendly/friendly.component';
import { NgxMasonryModule } from 'ngx-masonry';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { SharedModule } from '../../shared/shared.module';
import { EmployeeService } from './services/employee.service';
import { JobService } from './services/job.service';
import { TippyDirective } from '@ngneat/helipopper';
import { InViewportDirective } from 'ng-in-viewport';
import { MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [PersonalComponent, OfficeComponent, FriendlyComponent],
  imports: [
    CommonModule,
    SharedModule,
    OfficeRoutingModule,
    NgxMasonryModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
    TippyDirective,
    InViewportDirective,
    MatDialogModule,
    A11yModule,
    MatButtonModule,
  ],
  exports: [],
  providers: [EmployeeService, JobService],
})
export class OfficeModule {}
