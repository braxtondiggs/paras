import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) { }

  async canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot): Promise<boolean> {
    const uid = await this.auth.uid();
    const isLoggedIn = !!uid;
    if (!isLoggedIn) { await this.auth.anonymousLogin(); }
    return true;
  }
}
