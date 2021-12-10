import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanActivate {
  constructor(private router: Router) { }
  async canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot): Promise<boolean> {
    const { value } = await Storage.get({ key: 'intro' });
    if (value !== 'true') {
      this.router.navigate(['intro']);
      return false;
    }

    return true;
  }
}
