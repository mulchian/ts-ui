import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamChipSetComponent } from './team-chip-set/team-chip-set.component';
import { MatChipsModule } from '@angular/material/chips';
import { OverlayLoadingComponent } from './loading/overlay-loading/overlay-loading.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmModalComponent } from './modal/confirm-modal/confirm-modal.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [LoadingComponent, TeamChipSetComponent, OverlayLoadingComponent, ConfirmModalComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
  ],
  exports: [LoadingComponent, OverlayLoadingComponent, TeamChipSetComponent, ConfirmModalComponent],
})
export class SharedModule {}
