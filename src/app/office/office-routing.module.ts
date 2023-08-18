import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonalComponent } from './personal/personal.component';
import { OfficeComponent } from './office/office.component';

const routes: Routes = [
  {
    path: '',
    component: OfficeComponent,
  },
  {
    path: 'personal',
    component: PersonalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class OfficeRoutingModule {}
