// app/pages/tasks/tasks.routes.ts
import { Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskEditComponent } from './task-edit/task-edit.component';


export const TASKS_ROUTES: Routes = [
  { path: 'task-list', component: TaskListComponent },
  { path: 'task-create', component: TaskCreateComponent },
  { path: 'task-edit/:taskId', component: TaskEditComponent }
];
