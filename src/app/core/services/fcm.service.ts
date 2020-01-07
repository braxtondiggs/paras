import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DbService } from './db.service';
import * as moment from 'moment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  token: string;

  constructor(
    private afMessaging: AngularFireMessaging,
    private auth: AuthService,
    private db: DbService,
    private firebase: FirebaseX,
    private platform: Platform
  ) { }

  getPermission() {
    return from(this.getPermissionNative()).pipe(
      tap(token => this.token = token));
  }

  private async getPermissionNative() {
    if (this.platform.is('ios')) {
      await this.firebase.grantPermission();
    }
    const token = await this.firebase.getToken();
    const uid = await this.auth.uid();
    await this.db.updateAt(`devices/${token}`, this.getDeviceInfo(token, uid));
    return token;
  }

  listenToMessages() {
    let messages$: Observable<any>;
    if (this.platform.is('cordova')) {
      messages$ = this.firebase.onMessageReceived();
    } else {
      messages$ = this.afMessaging.messages;
    }
    return messages$.pipe((tap(v => this.showMessages(v))));
  }

  private showMessages(payload: any) {
    let body: any;
    if (this.platform.is('android')) {
      body = payload.body;
    } else {
      body = payload.notification.body;
    }
    // TODO: Show toast message
  }

  private getDeviceInfo(token: string, uid: string) {
    return {
      platform: this.platform.platforms(),
      token,
      uid,
      updateAt: moment().toDate()
    };
  }
}
