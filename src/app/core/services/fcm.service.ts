import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  token: string;

  constructor(
    private afMessaging: AngularFireMessaging,
    private firebase: FirebaseX,
    private platform: Platform
  ) { }

  getPermission(): Observable<string> {
    let token$: Observable<string>;
    if (this.platform.is('cordova')) {
      token$ = from(this.getPermissionNative());
    } else {
      token$ = this.getPermissionWeb();
    }
    return token$.pipe(
      tap(token => {
        this.token = token;
      })
    );
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

  private getPermissionWeb(): Observable<string> {
    return this.afMessaging.requestToken;
  }

  private async getPermissionNative() {
    let token: string;
    if (this.platform.is('ios')) {
      await this.firebase.grantPermission();
    }

    token = await this.firebase.getToken();
    return token;
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
}
