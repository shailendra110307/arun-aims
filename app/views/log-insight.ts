import { Component } from '@angular/core';
import { LogInsightGet } from '../model/logInsightGet-model';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { LogInsightGetService } from '../services/logInsightGet-service';
import * as _ from 'lodash';

@Component({
    providers: [LogInsightGetService],
    template: `<div id="breadcrumb" class="col-md-12">
                <ol class="breadcrumb">
                    <li><a [routerLink]="(isWidget ? '/widget-monitoring' : '/dashboard')">Home</a></li>
                    <li><a [routerLink]="(isWidget ? '/widget-monitoring' : '/monitoring')">Monitoring</a></li>
                    <li><a href="Javascript:void(0)">Log Insight</a></li>
                  </ol>
              </div>
              <div id="new-deployment-header" class="row">
                <div class="col-md-12"style="margin-left:5px;">
                  <h4>Log Insight</h4>
                </div>
              </div>
             
                <div class="container">
                 <table class="table table-bordered table-striped table-hover table-heading table-datatable dataTable" >
                   <thead>
                        <tr>
                          <th>Host</th>
                          <th>Source</th>
                          <th>Message</th>
                          <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let listItem of getLogList">
                          <td>{{listItem.host}}</td>
                          <td>{{listItem.message}}</td>
                          <td>{{listItem.source}}</td>
                          <td>{{listItem.timestamp}}</td>
                      </tr>
                    </tbody>
                    </table>
                     <div class="box-content">
                      <div class="col-sm-6">
                       <div class="dataTables_info" id="datatable-3_info">Showing 1 to 10 entries</div></div>
                         <div class="col-sm-6 text-right">
                          <div class="dataTables_paginate paging_bootstrap">
                            <ul class="pagination">
                            <li class="prev disabled"><a href="#">← Previous</a></li>
                            <li class="active"><a href="#">1</a></li>
                            <li class="next disabled"><a href="#">Next → </a></li>
                            </ul>
                          </div>
                         </div>
                         <div class="clearfix">
                         </div>
                       </div>
                  </div>`
})
export class LogInsightView {
    getLogList: LogInsightGet[];
    host: any;
    error_details: any;
    timestamp: Date;

    isWidget: boolean;

    constructor(private router: Router, route: ActivatedRoute, private logInsightGetService: LogInsightGetService) {
      this.host = route.snapshot.params['host'];
      this.error_details = route.snapshot.params['error_details'];
      this.timestamp = route.snapshot.params['timestamp'];
    this.getLogList = [];
    this.isWidget = false;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (_.startsWith(val.url, '/widget')) {
          this.isWidget = true;
        } else {
          this.isWidget = false;
        }
      }
    });
    }

    ngOnInit() {
        this.logInsightGetService.getLogInsight().subscribe(
            data => {
                this.getLogList = data;
            },
            () => console.log('Finished')
        );
    }

}
