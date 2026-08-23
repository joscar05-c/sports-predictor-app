import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'fixture/:id',
    loadComponent: () =>
      import('./fixture-detail/fixture-detail.page').then((m) => m.FixtureDetailPage),
  },
  {
    path: 'standings/:id',
    loadComponent: () =>
      import('./standings/standings.page').then((m) => m.StandingsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
