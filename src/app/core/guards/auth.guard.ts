import { Injectable } from '@angular/core';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private auth: AuthService) { }
  
  async canActivate(): Promise<boolean> {
    const uid = await this.auth.uid();
    const isLoggedIn = !!uid;
    if (!isLoggedIn) { await this.auth.anonymousLogin(); }
    return true;
  }
}
