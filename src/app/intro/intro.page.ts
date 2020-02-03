import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage {
  constructor(private router: Router) { }

  continue() {
    localStorage.setItem('intro', 'true');
    this.router.navigate(['/']);
  }
}
