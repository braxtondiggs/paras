import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Feed } from '../../interface';

@Component({
  selector: 'app-modal-detail',
  templateUrl: './modal-detail.component.html',
  styleUrls: ['./modal-detail.component.scss'],
})
export class ModalDetailComponent {
  @Input() item: Feed;
  constructor(private modal: ModalController) { }

  async dismiss() {
    await this.modal.dismiss();
  }
}
