
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ServerfactsInfo} from '../model/serverfactsInfo-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ServerfactsInfoService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getServerfactsInfo (): Observable<ServerfactsInfo[]> {
    return this.http.get(AppSettings.MONITORING_SERVERFACTS_INFO_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ServerfactsInfo[] {
    let body = res.json();
    return body.serverfactss.map(function (serverfacts: any) {
      const transformedserverfacts = new ServerfactsInfo();
      transformedserverfacts.active_users = serverfacts.active_users;
      transformedserverfacts.processes_running = serverfacts.processes_running;
      transformedserverfacts.status = serverfacts.status;
      transformedserverfacts.active_since = serverfacts.active_since;
      transformedserverfacts.avg_cpu_util = serverfacts.avg_cpu_util;
      transformedserverfacts.avg_memory_util = serverfacts.avg_memory_util;
      return transformedserverfacts;
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
