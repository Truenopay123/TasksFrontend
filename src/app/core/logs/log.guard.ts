import { inject } from '@angular/core';
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from '../auth/auth.service';

export const LogGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isLoggedIn()){
    return router.navigate(['/logs/dash-logs']);
  }else{
    return true;
  }
}
