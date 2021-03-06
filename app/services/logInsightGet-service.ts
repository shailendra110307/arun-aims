// logInsightGet

/**
 * Created by Rini Daniel on 1/6/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {LogInsightGet} from '../model/logInsightGet-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class LogInsightGetService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getLogInsight(): Observable<LogInsightGet[]> {
    return this.http.get(AppSettings.GET_LOG_INSIGHT_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }

  private extractResponse(res: Response): LogInsightGet[] {
    let body = res.json();
    return body.map(function (getLog: any) {
      const transformedLog = new LogInsightGet();
      transformedLog.host = getLog.host;
      transformedLog.message = getLog.message;
      transformedLog.source = getLog.source;
      transformedLog.timestamp = getLog.timestamp;
      return transformedLog;
    });
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
