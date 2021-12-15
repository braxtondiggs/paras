import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { IntroPage } from './intro.page';

describe('IntroPage', () => {
  const createComponent = createComponentFactory({
    component: IntroPage,
    imports: [IonicModule.forRoot(), RouterTestingModule]
  });

  let spectator: Spectator<IntroPage>;
  beforeEach(() => spectator = createComponent());

  it('should create', async () => {
    const app = spectator.component;
    expect(app).toBeTruthy();
  });
});