import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {LogInsightPost} from '../model/logInsightPost-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class LogInsightPostService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  postLogInsight (logPost: LogInsightPost): Observable<string> {
    console.log('Post req : ' + logPost);
    return this.http.post(AppSettings.POST_LOG_INSIGHT_URL, {request: logPost }, {headers: this.headers})
      .map(this.extractResponse)
      .catch(this.handleError);
  }

  private extractResponse(res: Response): string {
    // let body = res.json();
    return  'Saved Successfully';
  }
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
