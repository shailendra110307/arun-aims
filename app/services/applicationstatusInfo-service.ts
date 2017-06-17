
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ApplicationstatusInfo} from '../model/applicationstatusInfo-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ApplicationstatusInfoService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getApplicationstatusInfo (): Observable<ApplicationstatusInfo[]> {
    return this.http.get(AppSettings.MONITORING_APPLICATIONSTATUS_INFO_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ApplicationstatusInfo[] {
    let body = res.json();
    return body.applicationstatuss.map(function (applicationstatus: any) {
      const transformedApplicationstatus = new ApplicationstatusInfo();
      transformedApplicationstatus.user_list = applicationstatus.user_list;
     transformedApplicationstatus.active_user_count = applicationstatus.active_user_count;
     transformedApplicationstatus.dead_locks = applicationstatus.dead_locks;
     transformedApplicationstatus.buffer_busy_waits = applicationstatus.buffer_busy_waits;
     transformedApplicationstatus.query_sessions = applicationstatus.query_sessions;
     transformedApplicationstatus.fast_recovery_usage = applicationstatus.fast_recovery_usage;
     transformedApplicationstatus.log_file_completion = applicationstatus.log_file_completion;
     transformedApplicationstatus.db_Sequential_read_wait = applicationstatus.db_Sequential_read_wait;
     transformedApplicationstatus.direct_path_reads = applicationstatus.direct_path_reads;
     transformedApplicationstatus.db_file_size = applicationstatus.db_file_size;
     transformedApplicationstatus.rollbacks = applicationstatus.rollbacks;
     transformedApplicationstatus.commits = applicationstatus.commits;
     transformedApplicationstatus.up_time = applicationstatus.up_time;
     transformedApplicationstatus.redo_writes = applicationstatus.redo_writes;
     transformedApplicationstatus.parallel_writes = applicationstatus.parallel_writes;
      return transformedApplicationstatus;
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
