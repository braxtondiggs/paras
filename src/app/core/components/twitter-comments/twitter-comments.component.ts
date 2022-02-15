import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { DbService } from 'app/core/services';
import dayjs from 'dayjs';

@Component({
  selector: 'app-twitter-comments',
  templateUrl: './twitter-comments.component.html'
})
export class TwitterCommentsComponent implements OnInit {
  @Input() date?: Date;
  comments$?: Observable<Observable<Comment[]>>;

  constructor(private db: DbService, private http: HttpClient) {
  }

  ngOnInit(): void {
    console.log(dayjs(this.date).set('hour', 0).set('minute', 0).toDate());
    this.comments$ = this.db.collection$('feed', (ref) =>
      ref
        .where('date', '>', dayjs(this.date).set('hour', 0).set('minute', 0).subtract(3, 'hour').toDate())
        .where('date', '<', dayjs(this.date).set('hour', 23).set('minute', 59).subtract(3, 'hour').toDate()).orderBy('date', 'desc')).pipe(take(1), map(feed => {
          console.log(feed);
          const item = feed[0];
          if (!item) return of([]);
          return this.http.get<Comment[]>(`https://us-central1-paras-293d5.cloudfunctions.net/endpoints/nyc/comments/1493329454915018758${item.id}`);
        }));
  }
}

interface Comment {
  name: String;
  text: String;
  image: String;
}
