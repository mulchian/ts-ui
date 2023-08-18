import { NgModule } from '@angular/core';
import { PersonalComponent } from './personal/personal.component';
import { OfficeComponent } from './office/office.component';
import { OfficeRoutingModule } from './office-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ExtendedModule, FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [PersonalComponent, OfficeComponent],
  imports: [
    OfficeRoutingModule,
    MatToolbarModule,
    ExtendedModule,
    FlexModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [],
})
export class OfficeModule {}
