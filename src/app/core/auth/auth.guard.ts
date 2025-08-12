import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CanActivateFn, Router } from "@angular/router";

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isLoggedIn()){
    return true;
  }else{
    return router.navigate(['/auth/login']);
  }
};
