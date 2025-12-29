import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/services/user';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isUserAuthenticated$.pipe(
    map((isAuthenticated) => {
      console.log('GUARD VALUE:', isAuthenticated);
      return isAuthenticated ? true : router.createUrlTree(['/home/login']);
    })
  );
};
