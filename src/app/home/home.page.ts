import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { CalendarComponentOptions, DayConfig, CalendarComponentMonthChange, CalendarComponent } from 'ion2-calendar';
import { ModalController, IonSlides } from '@ionic/angular';
import { DbService } from '../core/services';
import { map } from 'rxjs/operators';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { Feed } from '../core/interface';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
  index = true; // TODO: Save using storage config
  date: string = moment().format();
  items: Feed[];
  slideOpts = {
    allowTouchMove: false,
    initialSlide: this.location.path().includes('calendar') ? 1 : 0
  };
  calendarOpts: CalendarComponentOptions = {
    daysConfig: [],
    from: new Date(2019, 11, 1),
    to: moment().year(2021).endOf('year').toDate()
  };
  @ViewChild('calendar') cal: CalendarComponent;
  @ViewChild('slider') slider: IonSlides;

  constructor(private db: DbService, private modal: ModalController, private location: Location) { }

  async onSelect(date: string) {
    const item = this.items.find((o) => moment(o.date.toDate()).isSame(date, 'day')) || moment(date);
    const modal = await this.modal.create({
      component: ModalDetailComponent,
      componentProps: {
        item
      }
    });

    modal.onDidDismiss().then(() => this.date = null);
    return await modal.present();
  }

  ngAfterViewInit(): void {
    this.getData(moment().startOf('month'), moment().endOf('month'));
  }

  onMonthChange($event: CalendarComponentMonthChange): void {
    this.getData(moment($event.newMonth.dateObj), moment($event.newMonth.dateObj).endOf('month'));
  }

  switchCalenderView() {
    this.index = !this.index;
    this.slider.slideTo(this.index ? 0 : 1);
    this.location.replaceState(`/home${this.index ? '' : '/calendar'}`);
  }

  private getData(start: moment.Moment, end: moment.Moment) {
    this.db.collection$('feed', (ref) =>
      ref
        .where('date', '>=', start.toDate())
        .where('date', '<', end.toDate())
        .where('type', '==', 'NYC'))
      .pipe(
        map((item: Feed[]) => item.filter(o => !o.active || !o.metered)))
      .subscribe((items) => {
        this.items = items;
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
