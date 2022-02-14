import * as functions from 'firebase-functions';
import * as cors from 'cors';
import * as express from 'express';

import { NYFeed, TwitterComments /*NJfeed*/ } from './twitter';
import { FCM } from './fcm';
import { NYCalender } from './calendar';

const app = express();
app.use(cors({ origin: true }));

app.get('/nyc/feed', NYFeed);
app.get('/nyc/calender', NYCalender);
app.get('/nyc/comments/:id', TwitterComments);

exports.endpoints = functions.runWith({ memory: '1GB' }).https.onRequest(app);
export const FCMNotification = functions.pubsub.schedule('every 15 minutes').timeZone('America/New_York').onRun(() => FCM());
