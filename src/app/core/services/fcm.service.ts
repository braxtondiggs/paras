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

  getPermission() {
    return from(this.getPermissionNative()).pipe(
      tap(token => this.token = token));
  }

  private async getPermissionNative() {
    if (this.platform.is('ios')) {
      await this.firebase.grantPermission();
    }
    return await this.firebase.getToken();
  }

  listenToMessages() {
    let messages$: Observable<any>;
    if (this.platform.is('cordova')) {
      messages$ = this.firebase.onMessageReceived();
      this.firebase.setAnalyticsCollectionEnabled(true);
      this.firebase.setCrashlyticsCollectionEnabled(true);
      this.firebase.setPerformanceCollectionEnabled(true);
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
}
