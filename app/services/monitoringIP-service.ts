import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import * as _ from 'lodash';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';
import {MonitoringIP} from '../model/monitoringIP-model';

@Injectable()
export class MonitoringIPService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }
// duration will be only in seconds
  getIPDetails (host: string): Observable<MonitoringIP> {
    console.log('IP : ' + host);
    const url = _.template(AppSettings.POST_IP_URL)({host});
    return this.http.get(url, {headers: this.headers})
      .map(this.extractResponse)
      .catch(this.handleError);
  }

  private extractResponse(res: Response): MonitoringIP {
    let body: MonitoringIP = <MonitoringIP> res.json();
    return  body;
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

