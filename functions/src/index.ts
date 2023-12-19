
/*import { onRequest } from "firebase-functions/v2/https";

import Fastify from 'fastify'

import { NYFeed, TwitterComments } from '../old/twitter';
import { FCM } from './fcm';
import { NYCalender } from '../old/calendar';*/
//import { getApp } from "firebase/app";
// import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// onRequest(fastify);
//

// app.get('/', (request, reply) => reply.send({ hello: 'world' }));

/*onRequest(app);
onSchedule('every 4 hours', () => {
	console.log('FCM');
});*/


import { onSchedule } from "firebase-functions/v2/scheduler";
import axios from 'axios'

onSchedule('every 1 minute', () => {
	console.log('FCM');
})

