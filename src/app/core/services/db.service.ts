import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  constructor(private afs: AngularFirestore) { }

  collection$(path: string, query?: QueryFn): Observable<any> {
    return this.afs.collection(path, query).snapshotChanges().pipe(map(actions => {
      return actions.map((a: any) => {
        const data: Object = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    }));
  }

  doc$(path: string): Observable<any> {
    return this.afs.doc(path).snapshotChanges().pipe(map((doc: any) => {
      return { id: doc.payload.id, ...doc.payload.data() as Object };
    }));
  }

  updateAt(path: string, data: Object): Promise<any> {
    const segments = path.split('/').filter(v => v);
    if (segments.length % 2) { // collection
      return this.afs.collection(path).add(data);
    } else { // document
      return this.afs.doc(path).set(data, { merge: true });
    }
  }

  delete(path: string): Promise<any> {
    return this.afs.doc(path).delete();
  }
}
