import * as functions from 'firebase-functions';
import { getNYFeed, twitterComments /*getNJfeed*/ } from './twitter';
import { FCM } from './fcm';
import { getNYCalender } from './calendar';

export const NYFeed = functions.https.onRequest(getNYFeed);
export const FCMNotification = functions.pubsub.schedule('every 15 minutes').timeZone('America/New_York').onRun(() => FCM());
export const NYCalender = functions.https.onRequest(getNYCalender); 
export const TwiiterComments = functions.https.onRequest(twitterComments); 
