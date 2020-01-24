import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanActivate {
  constructor(private router: Router) { }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    if (!localStorage.getItem('intro')) {
      this.router.navigate(['intro']);
      return false;
    }

    return true;
  }
}
