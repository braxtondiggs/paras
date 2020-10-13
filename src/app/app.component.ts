import { Component } from '@angular/core';
import { FcmService } from './core/services';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private fcm: FcmService,
    private platform: Platform,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    if (this.platform.is('cordova')) {
      this.statusBar.styleLightContent();
      this.fcm.getPermission().subscribe(() => {
        this.fcm.listenToMessages().subscribe();
      });
    }
  }
}
