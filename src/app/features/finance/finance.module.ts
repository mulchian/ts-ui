import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ExtendedModule, FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FinanceRoutingModule } from './finance-routing.module';

@NgModule({
  declarations: [],
  imports: [
    FinanceRoutingModule,
    MatToolbarModule,
    ExtendedModule,
    FlexModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [],
})
export class FinanceModule {}
