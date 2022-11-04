import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Feed } from '../../interface';

@Component({
  selector: 'app-modal-detail',
  templateUrl: './modal-detail.component.html',
  styleUrls: ['./modal-detail.component.scss'],
})
export class ModalDetailComponent {
  @Input() item?: Feed;
  constructor(private analytics: Analytics, private modal: ModalController) {
    logEvent(this.analytics, 'screen_view',   {
      firebase_screen: 'Calendar Detailed', 
      firebase_screen_class: 'app-modal-detail'
    });
  }

  async dismiss() {
    await this.modal.dismiss();
    logEvent(this.analytics, 'custom_event', {
      modal: 'dismiss',
      active: this.item?.active ? 'true' : 'false',
    });
  }
}
