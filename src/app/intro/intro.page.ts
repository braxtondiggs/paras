import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage'
import { IonContent, IonText, IonButton } from '@ionic/angular/standalone';

@Component({
  imports: [IonContent, IonText, IonButton],
  selector: 'app-intro',
  standalone: true,
  styleUrls: ['./intro.page.scss'],
  templateUrl: './intro.page.html',
})
export class IntroPage {
  private router: Router = inject(Router);

  async continue() {
    await Storage.set({ key: 'intro', value: 'true' });
    this.router.navigate(['/']);
  }
}
