import * as functions from 'firebase-functions';
import { getNYFeed /*getNJfeed*/ } from './twitter';

export const NYFeed = functions.runWith({ memory: '2GB' }).https.onRequest(getNYFeed);
