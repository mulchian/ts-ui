import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamChipSetComponent } from './team-chip-set/team-chip-set.component';
import { MatChipsModule } from '@angular/material/chips';
import { OverlayLoadingComponent } from './loading/overlay-loading/overlay-loading.component';

@NgModule({
  declarations: [
    LoadingComponent,
    TeamChipSetComponent,
    OverlayLoadingComponent,
  ],
  imports: [CommonModule, MatProgressSpinnerModule, MatChipsModule],
  exports: [LoadingComponent, TeamChipSetComponent],
})
export class SharedModule {}
