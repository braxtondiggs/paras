import * as functions from 'firebase-functions';
import { getNYFeed /*getNJfeed*/ } from './twitter';
import { FCM } from './fcm';
import { getNYCalender } from './calendar';

export const NYFeed = functions.runWith({ memory: '2GB' }).https.onRequest(getNYFeed);
export const FCMNotification = functions.runWith({ memory: '2GB' }).pubsub.schedule('every 15 minutes').timeZone('America/New_York').onRun(() => FCM());
export const NYCalender = functions.runWith({ memory: '2GB' }).pubsub.schedule('0 0 1 */3 *').timeZone('America/New_York').onRun(getNYCalender); // “At 00:00 on day-of-month 1 in every 3rd month.”
