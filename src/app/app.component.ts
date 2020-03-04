import { Component } from '@angular/core';
import { FcmService } from './core/services';
import { Platform, AlertController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private alert: AlertController,
    private fcm: FcmService,
    private network: Network,
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen
  ) {
    this.initializeApp();
    this.setTheme();
  }

  private async initializeApp() {
    await this.platform.ready();
    if (this.platform.is('cordova')) {
      if (this.network.type !== 'none') {
        this.statusBar.styleLightContent();
        this.fcm.getPermission().subscribe(() => {
          setTimeout(() => this.splashScreen.hide(), 1000);
          this.fcm.listenToMessages().subscribe();
        });
      } else {
        await this.showNetworkAlert();
      }
    }
  }

  private setTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.toggleDarkTheme(prefersDark.matches);
    // tslint:disable-next-line: deprecation
    prefersDark.addListener((mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));
  }

  private toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
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
}
