import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { Network } from '@capacitor/network';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private alert: AlertController, private platform: Platform) {
    this.migrateData();
    this.initializeApp();
    this.setTheme();
  }

  private async initializeApp() {
    await this.platform.ready();
    if (!this.platform.is('cordova')) return;
    if (!await Network.getStatus()) await this.showNetworkAlert();
    this.getFCMNotification();
  }

  private getFCMNotification() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') PushNotifications.register();
    });

    PushNotifications.addListener('registration', async (token: Token) => {
      await Storage.set({ key: 'token', value: token.value });
    });

    PushNotifications.addListener('registrationError', async (error: any) => {
      const alert = await this.alert.create({
        header: 'ASP For NYC',
        message: 'Notification token registration failed, you may not be able to receive push notifications or alerts!',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
            handler: async () => {
              await Storage.set({ key: 'tokenFailure', value: 'true' });
              await Storage.set({ key: 'tokenFailureError', value: error.toString() });
            }
          }
        ]
      });

      await alert.present();
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      alert('Push received: ' + JSON.stringify(notification));
    });
  }
  private async setTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const { value } = await Storage.get({ key: 'darkMode' });
    const darkMode = (value === 'true');
    if (darkMode) await Storage.set({ key: 'darkMode', value: prefersDark.matches.toString() });
    this.toggleDarkTheme(darkMode);
    prefersDark.addEventListener('change', (mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));
  }

  private async toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
    await Storage.set({ key: 'darkMode', value: shouldAdd.toString() });
  }

  private async showNetworkAlert() {
    const alert = await this.alert.create({
      header: 'Network Error',
      message: 'An Internet connection is required to use this application, please connect and try again.',
      backdropDismiss: false,
      keyboardClose: false
    });
    await alert.present();
  }

  private async migrateData() {
    const darkMode = localStorage.getItem('darkMode');
    if (localStorage.getItem('intro')) { await Storage.set({ key: 'intro', value: 'true' }); localStorage.removeItem('intro'); }
    if (darkMode) { await Storage.set({ key: 'darkMode', value: darkMode }); localStorage.removeItem('darkMode'); }
  }
}
