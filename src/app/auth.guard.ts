import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const userData = sessionStorage.getItem('loggedInUser');

    if (!userData) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = JSON.parse(userData);
    const isAdminRoute = state.url.startsWith('/admin');


    if (isAdminRoute && !user.isAdmin) {
      this.router.navigate(['/customer/restaurants']);
      return false;
    }

    
    if (!isAdminRoute && user.isAdmin) {
      this.router.navigate(['/admin']);
      return false;
    }

    return true;
  }
}
