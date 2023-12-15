import { Routes } from '@angular/router';
import { AuthGuard, IntroGuard } from './core/guards';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'intro',
    data: { title: 'Intro' },
    loadComponent: () => import('./intro/intro.page').then(m => m.IntroPage)
  },
  {
    path: 'home',
    data: { title: 'Home' },
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard, IntroGuard],
    children: [
      {
        path: 'calendar',
        data: { title: 'Calender' },
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      }
    ]
  },
  {
    path: 'settings',
    data: { title: 'Settings' },
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage),
    canActivate: [AuthGuard]
  }
];
