import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MonitoringGraph } from '../model/monitoringGraph-model';
import { MonitoringGraphService } from '../services/monitoring-service';

@Component({
  selector: 'monitoring-graphs',
  providers: [
    MonitoringGraphService
  ],
  styles: ['.filters {margin-bottom: 10px;}'],
  template: `<div class="row">
                <div class="container-fluid panel" style="background-color:#e0e0e2; margin-top:10px">
                    <div class="col-md-8" style="margin-top:10px">
                              <div class="col-md-9 filters" *ngIf="this.monitoringGraph.filterKeys.length > 0" style="margin-top:5px">
                                  <div class="btn-group btn-group-xs " role="group" style="margin-right:15px;"
                              *ngFor="let filterKey of this.monitoringGraph.filterKeys">
                                    <button type="button" class="btn" style="background-color:#b6b6ba" >
                                    {{filterKey}}: {{this.monitoringGraph.filters[filterKey]}}</button>
                                    <button type="button" class="btn" (click)="this.removeFilter(filterKey)"
                                    tabindex="5" style="background-color:#b6b6ba"><i class="fa fa-close"></i></button>
                                </div>
                              </div>
                            <div class="col-md-3 btn-group-xs" style="margin-top:5px" 
                            *ngIf="this.monitoringGraph.filterKeys.length > 0">
                                <button class="btn" style="background-color:#b6b6ba" (click)="this.clearThisFilter()" >Clear Filter</button>
                          </div>
                    </div>
                    <div class="form-group col-md-4"style="margin-top:10px">
                        <div class="col-md-10">
                        <div class="col-md-5">
                            <label for="data-center" class="col-form-label" style="padding-top:10px;">Data Center:</label>
                            </div>
                            <div class="col-md-7">
                            <select class="populate placeholder form-control" id="data-center"
                        [(ngModel)]="this.monitoringGraph.datacenter">
                            <option value="hyderabad">Hyderabad, AP, India</option>
                            <option value="dallas">Dallas, TX, USA</option>
                            <option value="houston">Houston, TX, USA</option>
                            <option value="mountainview">Mountain View, CA, USA</option>
                            </select>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button class="btn" (click)="this.refreshPage()" ><i class="fa fa-refresh" aria-hidden="true"></i></button>
                        </div>
                    </div>
                </div>
            </div>
     <div class="row" style="margin-top:15px;">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <div class="x_panel" *ngIf="this.monitoringGraph.projects && this.monitoringGraph.projects.length">
                  <div class="x_title">
                    <h2 class="container monitoring_center">Status</h2>
                    <div class="clearfix"></div>
                  </div>
                  <div class="x_content">
                    <filterpie-chart title="Status" seriesTitle="Status" (onFilterChange)="this.applyFilter('status', $event.name)"
                      [series]="this.monitoringGraph.statusDistribution" 
                      height="350" width="200"></filterpie-chart>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <div class="x_panel" *ngIf="this.monitoringGraph.projects && this.monitoringGraph.projects.length">
                  <div class="x_title">
                    <h2 class="container monitoring_center">Provider</h2>
                    <div class="clearfix"></div>
                  </div>
                  <div class="x_content">
                    <filterpie-chart title="Provider" 
                    seriesTitle="Provider" (onFilterChange)="this.applyFilter('provider', $event.name)"
                      [series]="this.monitoringGraph.providerDistribution" 
                      height="350" width="200"></filterpie-chart>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <div class="x_panel" *ngIf="this.monitoringGraph.projects && this.monitoringGraph.projects.length">
                  <div class="x_title">
                    <h2 class="container monitoring_center">Operating System</h2>
                    <div class="clearfix"></div>
                  </div>
                  <div class="x_content" style="text-align: center">
                    <filterpie-chart title="OS" seriesTitle="Operating System" [series]="this.monitoringGraph.osDistribution"
                      (onFilterChange)="this.applyFilter('operating_system', $event.name)"
                      height="350" width="200"></filterpie-chart>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12"  *ngIf="this.monitoringGraph.showUsageGraph">
                <div class="x_panel" *ngIf="this.monitoringGraph.projects && this.monitoringGraph.projects.length">
                  <div class="x_title">
                    <h2 class="container monitoring_center">Usage</h2>
                    <div class="clearfix"></div>
                  </div>
                  <div class="x_content">
                    <filterpie-chart  title="Usage" seriesTitle="Usage" [series]="this.monitoringGraph.usageDistribution" 
                      height="350" width="200"></filterpie-chart>
                  </div>
                </div>
              </div>
            </div> `
})
export class MonitoringGraphView {
  monitoringGraph: MonitoringGraph;
  selectedFilter: string;
  subscription: any;
  timer: any;
  edited: boolean;
  @Output() onIPChange: EventEmitter<any> = new EventEmitter();

  constructor(private monitoringGraphService: MonitoringGraphService,
    private ref: ChangeDetectorRef) {
    this.monitoringGraph = new MonitoringGraph();
  }

  applyFilter(property: string, value: string) {
    this.edited = true;
    this.monitoringGraph.setFilter(property, value);
    this.ref.detectChanges();
    this.onIPChange.emit({ filteredIPs: this.monitoringGraph.filterIPDistribution });
  }

  clearThisFilter() {
    this.edited = false;
    this.monitoringGraph.clearFilter();
    this.onIPChange.emit({ filteredIPs: this.monitoringGraph.filterIPDistribution });
  }

  removeFilter(filterKey: string) {
    this.monitoringGraph.removeFilter(filterKey);
    this.onIPChange.emit({ filteredIPs: this.monitoringGraph.filterIPDistribution });
  }

  ngOnInit() {
    this.edited = false;
    this.callService();
  }

  refreshPage() {
    this.edited = true;
    this.callService();
    this.onIPChange.emit({ filteredIPs: this.monitoringGraph.filterIPDistribution });
  }
  callService() {
    // this.timer = Observable.timer(0, 20000);
    // this.subscription = this.timer.subscribe(() => {
    this.monitoringGraphService.getMonitoringData().subscribe(
      data => this.monitoringGraph.setData(data),
      () => console.log('Finished')
    );
  }

  ngOnDestroy() {
    if (this.subscription && this.subscription.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }
}
