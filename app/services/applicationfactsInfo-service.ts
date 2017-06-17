
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ApplicationfactsInfo} from '../model/applicationfactsInfo-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ApplicationfactsInfoService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getApplicationfactsInfo (): Observable<ApplicationfactsInfo[]> {
    return this.http.get(AppSettings.MONITORING_APPLICATIONFACTS_INFO_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ApplicationfactsInfo[] {
    let body = res.json();
    return body.applicationfactss.map(function (applicationfacts: any) {
      const transformedApplicationfacts = new ApplicationfactsInfo();
      transformedApplicationfacts.replication_count = applicationfacts.replication_count;
      transformedApplicationfacts.avg_usage = applicationfacts.avg_usage;
      transformedApplicationfacts.port_numbers = applicationfacts.port_numbers;
      return transformedApplicationfacts;
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
