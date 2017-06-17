/**
 * Created on 5/23/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ApplicationInfo} from '../model/applicationInfo-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ApplicationInfoService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getApplicationInfo (): Observable<ApplicationInfo[]> {
    return this.http.get(AppSettings.MONITORING_APPLICATION_INFO_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ApplicationInfo[] {
    let body = res.json();
    return body.applications.map(function (application: any) {
      const transformedApplication = new ApplicationInfo();
      transformedApplication.name = application.name;
      transformedApplication.version = application.version;
      transformedApplication.issuer = application.issuer;
      transformedApplication.license_exp = application.license_exp;
      transformedApplication.project = application.project;
      transformedApplication.role = application.role;
      return transformedApplication;
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
