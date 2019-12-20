import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CalendarComponentOptions, DayConfig, CalendarComponentMonthChange, CalendarComponent } from 'ion2-calendar';
import { DbService } from '../core/services';
import { map } from 'rxjs/operators';
import { Feed } from '../core/interface';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
  index = true; // TODO: Save using storage config
  date: string;
  slideOpts = {
    allowTouchMove: false
  };
  calendarOpts: CalendarComponentOptions = {
    from: new Date(2000, 0, 1),
    daysConfig: []
  };
  @ViewChild('calendar', { static: false }) cal: CalendarComponent;

  constructor(private db: DbService) { }

  onSelect($event) {
    console.log($event); // TODO: open up detail view
  }

  ngAfterViewInit(): void {
    this.getData(moment().startOf('month'), moment().endOf('month'));
  }

  onMonthChange($event: CalendarComponentMonthChange): void {
    this.getData(moment($event.newMonth.dateObj), moment($event.newMonth.dateObj).endOf('month'));
  }

  private getData(start: moment.Moment, end: moment.Moment) {
    this.db.collection$('feed', (ref) =>
      ref
        .where('date', '>=', start.toDate())
        .where('date', '<', end.toDate()))
      .pipe(
        map((item: Feed[]) => item.filter(o => !o.active || !o.metered)))
      .subscribe((items) => {
        const daysConfig: DayConfig[] = items.map(item => ({
          cssClass: this.getCalendarClass(item),
          date: item.date.toDate(),
          marked: true
        }));
        this.calendarOpts.daysConfig = daysConfig;
        this.cal.options = this.calendarOpts;
      });
  }

  private getCalendarClass(item: Feed): string | undefined {
    if (item.active) {
      return 'active';
    } else if (item.metered) {
      return 'metered';
    }
  }
}
