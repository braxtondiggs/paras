import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage'

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage {
  constructor(private router: Router) { }

  async continue() {
    await Storage.set({ key: 'intro', value: 'true' });
    this.router.navigate(['/']);
  }
}
