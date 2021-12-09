import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { Storage } from '@capacitor/storage';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;
  constructor(private afAuth: AngularFireAuth, private db: DbService) {
    this.user$ = afAuth.authState.pipe(
      switchMap(user => (user ? db.doc$(`users/${user.uid}`) : of(null)))
    );
  }

  async anonymousLogin() {
    const credential = await this.afAuth.signInAnonymously();
    await Storage.set({ key: 'uid', value: credential.user.uid });
    return await this.updateUserData(credential.user);
  }

  uid(): Promise<any> {
    return this.user$.pipe(take(1), map(u => u && u.uid)).toPromise();
  }

  private updateUserData({ uid, }) {
    const path = `users/${uid}`;
    const data = { uid, created: new Date() };
    return this.db.updateAt(path, data);
  }
}
