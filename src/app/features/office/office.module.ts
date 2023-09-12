import { NgModule } from '@angular/core';
import { PersonalComponent } from './components/personal/personal.component';
import { OfficeComponent } from './office.component';
import { OfficeRoutingModule } from './office-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ExtendedModule, FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FriendlyComponent } from './components/friendly/friendly/friendly.component';
import { NgxMasonryModule } from 'ngx-masonry';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
  declarations: [PersonalComponent, OfficeComponent, FriendlyComponent],
  imports: [
    CommonModule,
    OfficeRoutingModule,
    MatToolbarModule,
    ExtendedModule,
    FlexModule,
    MatButtonModule,
    MatIconModule,
    NgxMasonryModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
  ],
  exports: [],
})
export class OfficeModule {}
