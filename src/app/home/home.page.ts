import { Component } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  index = true; // TODO: Save using storage config
  date: string;
  type: 'string';
  slideOpts = {
    allowTouchMove: false
  };
  calendarOpts: CalendarComponentOptions = {
    from: new Date(2000, 0, 1)
  };

  constructor() { }

  onChange($event) {
    console.log($event);
  }
}
