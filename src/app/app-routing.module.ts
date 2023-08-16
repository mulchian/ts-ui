import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CustomPreloadingStrategy } from './services/custom-preloading.strategy';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    data: {
      preload: true,
    },
  },
  {
    path: 'office',
    loadChildren: () =>
      import('./office/office.module').then(m => m.OfficeModule),
    data: {
      preload: true,
    },
  },
  {
    path: '**',
    // component: PageNotFoundComponent
    redirectTo: '/home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: CustomPreloadingStrategy,
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always', // having paramMap of all parent routes
    }),
  ],
  exports: [RouterModule],
  providers: [CustomPreloadingStrategy],
})
export class AppRoutingModule {}
