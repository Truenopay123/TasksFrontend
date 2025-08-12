import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CanActivateFn, Router } from "@angular/router";

export const TasksGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isLoggedIn()){
    return router.navigate(['/tasks/task-list']);
  }else{
    return true;
  }
};
