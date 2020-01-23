import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Feed } from '../../interface';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-detail',
  templateUrl: './modal-detail.component.html',
  styleUrls: ['./modal-detail.component.scss'],
})
export class ModalDetailComponent {
  @Input() item: Feed | moment.Moment;
  constructor(private modal: ModalController) { }

  async dismiss() {
    await this.modal.dismiss();
  }
}
