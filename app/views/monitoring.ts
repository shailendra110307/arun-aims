import { Component, ChangeDetectorRef } from '@angular/core';
import { AlertSummary } from '../model/alertSummary-model';
import { AlertSummaryService } from '../services/alertSummary-service';
import { Router, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';

@Component({
  providers: [
    AlertSummaryService
  ],
  template: `<div class="row">
                <div id="breadcrumb" class="col-md-12">
                  <ol class="breadcrumb">
                    <li><a [routerLink]="(isWidget ? '/widget-monitoring' : '/dashboard')">Home</a></li>
                    <li><a [routerLink]="(isWidget ? '/widget-monitoring' : '/monitoring')">Monitoring</a></li>
                  </ol>
                </div>
             </div>
             <monitoring-graphs (onIPChange)="this.onIPChange($event.filteredIPs)"></monitoring-graphs>
            <div id="new-deployment-header" class="row">
                <div class="col-md-12">
                  <h4>Alert Summary:</h4>
                </div>
            </div>
              <div>
                <div class="box-content no-padding table-responsive">
                 <table class="table table-bordered table-striped table-hover table-heading table-datatable dataTable" >
                   <thead>
                        <tr>
                          <th>IP Address / Host</th>
                          <th>Description</th>
                           <th>Severity</th>
                            <th>Time Stamp</th>
                             <th>Status</th>
                          <th>Age</th>
                        </tr>
                    </thead>
                     <tbody>
                      <tr *ngFor="let alert of alertList">
                          <td><a 
                          [routerLink]="(isWidget ? '/widget-monitoring/' : '/monitoring/')+(alert.ip_address || alert.host)">
                          <u>{{alert.ip_address || alert.host}}</u></a></td>
                          <td><a
                          [routerLink]="(isWidget ? '/widget-log-insight/' : '/log-insight/')+
                          (alert.ip_address || alert.host) + '/' +alert.time_stamp + '/' +alert.error_details"><u>
                          {{alert.error_details}}</u></a></td>
                          <td>{{alert.severity}}</td>
                          <td>{{alert.time_stamp}}</td>
                          <td>{{alert.status}}</td>
                          <td>{{alert.age}}</td>
                          </tr>
                    </tbody>
                   </table>
                  </div>
              </div>
              <div class="box-content">
                      <div class="col-sm-6">
                       <div class="dataTables_info" id="datatable-3_info">
                       Showing 
                       {{((pageIndex-1)*itemsPerPage)+1}}
                        to 
                        {{((pageIndex-1)*itemsPerPage)+(alertList &&alertList.length || 0)}}
                         alerts</div></div>
                         <div class="col-sm-6 text-right">
                          <div class="dataTables_paginate paging_bootstrap">
                            <ul class="pagination">
                            <li class="prev" [ngClass]="{'disabled': pageIndex === 1}">
                            <a (click)="pageIndex > 1 && this.onPageChange(pageIndex-1)">← Previous</a></li>
                            <li class="active"><a>{{pageIndex}}</a></li>
                            <li class="next" [ngClass]="{'disabled': pageIndex === totalPages}">
                            <a (click)="pageIndex < totalPages && this.onPageChange(pageIndex+1)">Next → </a></li>
                            </ul>
                          </div>
                         </div>
                         <div class="clearfix">
                       </div>
                 </div>`
})
export class MonitoringView {
  alertList: AlertSummary[];
  initialAlertList: AlertSummary[];
  alertIPs: string[];
  isWidget: boolean;

  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;

  constructor(private router: Router, private alertSummaryService: AlertSummaryService, private ref: ChangeDetectorRef) {
    this.isWidget = false;
    this.pageIndex = 1;
    this.itemsPerPage = 5;
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

  onPageChange(newIndex: number) {
    this.pageIndex = newIndex;
    this.alertList = this.createPageChunk(this.initialAlertList);
  }

  callAlerts() {
    this.alertSummaryService.getAlertSummary().subscribe(
      data => {
        this.pageIndex = 1;
        this.initialAlertList = data;
        this.alertList = this.createPageChunk(data);
      },
      () => console.log('Finished')
    );
  }

  createPageChunk(data: any[]): any[] {
    this.totalPages = _.ceil(data.length / this.itemsPerPage);
    return _.chunk(data || [], this.itemsPerPage)[this.pageIndex - 1];
  }

  onIPChange(filteredIPs: any[]) {
    this.pageIndex = 1;
    if (filteredIPs === undefined) {
      this.alertList = this.createPageChunk(this.initialAlertList);
    } else {
      this.alertList = this.createPageChunk(_.filter(this.initialAlertList || [], function (alert) {
        return _.includes(filteredIPs, alert.ip_address);
      }));
    }
  }

  ngOnInit() {
    this.callAlerts();
  }
}
