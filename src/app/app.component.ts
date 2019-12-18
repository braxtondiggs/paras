import { Component } from '@angular/core';
import { FcmService } from './core/services';
import { Platform } from '@ionic/angular';

import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';

const { StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private fcm: FcmService,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        StatusBar.setStyle({ style: StatusBarStyle.Light });
        this.fcm.getPermission().subscribe();
        this.fcm.listenToMessages().subscribe();
      }
    });
  }
}
