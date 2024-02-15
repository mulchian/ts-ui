import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FinanceRoutingModule } from './finance-routing.module';

@NgModule({
  declarations: [],
  imports: [FinanceRoutingModule, MatButtonModule, MatIconModule],
  exports: [],
})
export class FinanceModule {}
