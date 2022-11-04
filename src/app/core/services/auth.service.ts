import { Injectable } from '@angular/core';
import { Auth, signInAnonymously, user, User } from '@angular/fire/auth';
import { Analytics,  setUserId } from '@angular/fire/analytics';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { traceUntilFirst } from '@angular/fire/performance';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  constructor(private auth: Auth, private afs: Firestore, private analytics: Analytics) {
    this.user$ = user(auth);
  }

  async anonymousLogin() {
    const { user } = await signInAnonymously(this.auth);
    if (user) {
      await Storage.set({ key: 'uid', value: user.uid });
      setUserId(this.analytics, user.uid);
      return await setDoc(doc(this.afs, `users/${user.uid}`), { uid: user.uid, created: new Date() }, { merge: true });
    } else {
      await Storage.set({ key: 'uid', value: 'null' });
      // TODO: Hide Setting If No UID
    }
  }

  async getUser(): Promise<User | null> {
    return await this.user$.pipe(take(1)).toPromise();
  }

  async uid(): Promise<string | null> {
    return await this.user$.pipe(traceUntilFirst('getUserId'), take(1), map(u => u && u.uid)).toPromise();
  }
}
