/**
 * Created by Rini Daniel on 1/6/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ExistingInfrastructure} from '../model/existingInfrastructure-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ExistingInfrastructureService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getExistingInfra (): Observable<ExistingInfrastructure[]> {
    return this.http.get(AppSettings.EXISTING_INFRASTRUCTURE_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }

  private extractResponse(res: Response): ExistingInfrastructure[] {
    let body = res.json();
    return body.req_list.map(function (infra: any) {
      const transformedInfra = new ExistingInfrastructure();
      transformedInfra.cloud_id = infra.cloud_id;
      transformedInfra.cloud_type = infra.cloud_type;
      transformedInfra.provider = infra.provider;
      transformedInfra.req_name = infra.req_name;
      transformedInfra.status = infra.status;
      transformedInfra.time_stamp = infra.time_stamp;
      return transformedInfra;
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
