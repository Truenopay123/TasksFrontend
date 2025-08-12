import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './core/auth/auth.guard';
import { TasksGuard } from './core/tasks/tasks.guard';
//import { LogGuard } from './core/logs/log.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [TasksGuard] // Protege las rutas de tareas
  },
  {
    path: 'tasks',
    loadChildren: () => import('./pages/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
    canActivate: [AuthGuard] // Protege todas las rutas bajo /tasks
  },
  {
    path: 'logs',
    loadChildren: () => import('./pages/logs/logs.routes').then(m => m.DASH_LOGS_ROUTES),
    //canActivate: [LogGuard] // Protege todas las rutas bajo /dash-logs
  },
  { path: '**', component: NotFoundComponent } // Redirige a login si la ruta no existe
];
