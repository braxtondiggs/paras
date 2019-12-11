import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export async function FCM() {
  const query = await db.collection('notifications').where('time', '>=', 'Start Time').where('time', '<=', ' End Time').get();
}
