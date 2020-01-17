import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { Feed } from '../../interface';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnChanges {
  detail: Item;
  @Input() item: Feed & moment.Moment;

  ngOnChanges(changes: SimpleChanges) {
    const currentItem: SimpleChange = changes.item;
    if (currentItem.currentValue) {
      const data: Feed | moment.Moment = changes.item.currentValue;
      if (!moment.isMoment(data)) {
        this.detail = {
          ...data,
          created: moment(data.created.toDate()).fromNow(),
          date: moment(data.date.toDate()).format('MMMM Do YYYY'),
          future: moment(data.date.toDate()).isSameOrBefore(moment())
        };
      } else {
        this.detail = {
          active: true,
          created: data.fromNow(),
          date: data.format('MMMM Do YYYY'),
          future: data.isSameOrBefore(moment()),
          metered: true
        };
      }
      console.log(this.detail);
      console.log(changes.item.currentValue);
    }
  }
}

interface Item {
  active: Boolean;
  created: String;
  date: String;
  future: Boolean;
  metered: Boolean;
  reason?: String;
}
