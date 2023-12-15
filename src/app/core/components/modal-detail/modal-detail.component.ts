import { Component, Input, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Feed } from '../../interface';
import { CardDetailComponent } from './../card-detail/card-detail.component';

@Component({
  standalone: true,
  imports: [CardDetailComponent, IonButton, IonButtons, IonContent, IonHeader, IonToolbar],
  selector: 'app-modal-detail',
  templateUrl: './modal-detail.component.html',
  styleUrls: ['./modal-detail.component.scss'],
})
export class ModalDetailComponent {
  private analytics: Analytics = inject(Analytics);
  @Input() item?: Feed;
  
  constructor(private modal: ModalController) {
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
