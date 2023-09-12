import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonalComponent } from './components/personal/personal.component';
import { OfficeComponent } from './office.component';
import { FriendlyComponent } from './components/friendly/friendly/friendly.component';

const routes: Routes = [
  {
    path: '',
    component: OfficeComponent,
  },
  {
    path: 'personal',
    component: PersonalComponent,
  },
  {
    path: 'friendly',
    component: FriendlyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class OfficeRoutingModule {}
