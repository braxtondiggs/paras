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

  getPermission(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      console.log('sup');
      // this.firebase.grantPermission().then(() => {
      this.firebase.getToken().then((token) => {
        console.log('token');
        console.log(token);
        this.token = token;
        return resolve();
      }, (error) => {
        console.log(error);
      });
      // });
    });
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
}
