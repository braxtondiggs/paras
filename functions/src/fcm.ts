import { MessagingPayload, getMessaging } from "firebase-admin/messaging";
import { Firestore, QueryDocumentSnapshot, WriteResult } from 'firebase-admin/firestore';
import dayjs from 'dayjs';

const payload: MessagingPayload = {
  notification: {
    title: 'Alternate Side Parking'
  }
};

async function getImmediateNotifications(db: Firestore, action: string) {
  const isToday = action === 'today';
  const id = isToday ? dayjs().format('YYYYMMDD') : dayjs().add(1, 'day').format('YYYYMMDD');
  const feedSnap = await db.collection('feed').doc(id).get();
  if (!feedSnap.exists) return;
  const { active, text } = feedSnap.data() as Feed;
  const query = await db.collection('notifications').where(action, '==', 'immediately').where('type', '==', 'NYC').get();
  const promise: QueryDocumentSnapshot[] = [];
  const tokens: string[] = [];
  if (payload.notification) payload.notification.body = !isToday  ? text.replaceAll(/\./g, ' tomorrow.') : text;
  query.forEach(snapshot => promise.push(snapshot));
  for (const snapshot of promise) {
    const { exceptionOnly, nextDay, today, token } = snapshot.data();
    if (token && ((today === 'immediately' && isToday) || (nextDay === 'immediately' && !isToday))) {
      if (checkException(exceptionOnly, active)) {
        tokens.push(token);
      }
    }
  }

  await sendToDevices(tokens, promise);
}

async function getCustomNotifications(db: Firestore) {
  const data = await db.collection('feed').orderBy('created', 'desc').limit(1).get();
  let promise: QueryDocumentSnapshot[] = [];
  data.forEach(snapshot => promise.push(snapshot));
  let isToday = false;
  let isActive = false;
  for (const snapshot of promise) {
    const { date, text } = snapshot.data();
    if (payload.notification) payload.notification.body = !isToday  ? text.replaceAll(/\./g, ' tomorrow.') : text;
    isToday = dayjs(date.toDate()).isSame(dayjs(), 'day');
  }
  promise = []; // reset
  const query = await db.collection('notifications').where(isToday ? 'today' : 'nextDay', '==', 'custom').where('type', '==', 'NYC').get();
  const tokens: string[] = [];
  query.forEach(snapshot => promise.push(snapshot));
  for (const snapshot of promise) {
    const { exceptionOnly, nextDay, nextDayCustom, today, todayCustom, token } = snapshot.data();
    let date = isToday ? dayjs().format('MM/DD/YYYY') : dayjs().add(1, 'day').format('MM/DD/YYYY');
    date = isToday ? `${date} ${todayCustom}` : `${date} ${nextDayCustom}`;
    isActive = dayjs(date).isAfter(dayjs()) && dayjs(date).isBefore(dayjs().add(15, 'minute'));
    if ((today === 'custom' && isToday && isActive) || (nextDay === 'custom' && !isToday && isActive)) {
      if (token && checkException(exceptionOnly, isActive)) {
        tokens.push(token);
      }
    }
  }

  await sendToDevices(tokens, promise);
}

async function sendToDevices(tokens: string[], promise: QueryDocumentSnapshot[]) {
  if (tokens.length <= 0) return;
  const messaging = getMessaging();
  const messages = tokens.map(token => ({ ...payload, token }));
  console.log(`There are ${promise.length} tokens to send notifications to.`);
  const { responses } = await messaging.sendAll(messages);  // Limit to 500 devices, will need to optimize later
  const deadTokens: Promise<WriteResult>[] = [];
  responses.forEach((result, index) => {
    const error = result.error;
    if (error) {
      console.error('Failure sending notification to', tokens[index], error); // Cleanup the tokens who are not registered anymore.
      if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
        deadTokens.push(promise[index].ref.delete());
      }
    }
  });
  if (deadTokens.length <= 0) return;
  return Promise.all(deadTokens);
}

function checkException(exception: boolean, active: boolean): boolean {
  return exception && active ?  false : true;
}

interface Notification {
  exceptionOnly: boolean;
  nextDay: string;
  nextDayCustom: string;
  today: string;
  todayCustom: string;
  token: string;
  type: string;
}


interface Feed {
  active: boolean;
  created: Date;
  date: string;
  id: string;
  metered: boolean;
  reason: string;
  text: string;
  type: string;
}
export { getImmediateNotifications, getCustomNotifications}
