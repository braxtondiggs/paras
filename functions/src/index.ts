import * as functions from 'firebase-functions';
import { getNYFeed /*getNJfeed*/ } from './twitter';
import { FCM } from './fcm';

export const NYFeed = functions.runWith({ memory: '2GB' }).https.onRequest(getNYFeed);
export const FCMNotification = functions.runWith({ memory: '2GB' }).pubsub.schedule('every 15 minutes').timeZone('UTC').onRun(() => FCM());
