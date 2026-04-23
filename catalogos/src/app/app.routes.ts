import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home').then(m => m.Home) 
  },
  { 
    path: 'categoria/:id', 
    loadComponent: () => import('./pages/categoria/categoria').then(m => m.Categoria) 
  },
  { 
    path: 'detalles/:id', 
    loadComponent: () => import('./pages/detalles/detalles').then(m => m.Detalles) 
  },
  { path: '**', redirectTo: '/home' }
];