import {Component} from '@angular/core';
import {ExistingInfrastructure} from '../model/existingInfrastructure-model';
import {ExistingInfrastructureService} from '../services/existing-infrastructure-service';
import * as _ from 'lodash';

@Component({
  providers: [ExistingInfrastructureService],
  template: `<div id="breadcrumb" class="col-md-12">
                <ol class="breadcrumb">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="#">Orchestration</a></li>
                    <li><a href="#">Infrastructure</a></li>
                    <li><a href="#">Existing Infrastructure</a></li>
                  </ol>
              </div>
              <div id="new-deployment-header" class="row">
                <div class="col-xs-12">
                  <h4>Existing Infrastructure</h4>
                </div>
              </div>
              <div>
                <div class="box-content no-padding table-responsive">
                 <table class="table table-bordered table-striped table-hover table-heading table-datatable dataTable" >
                   <thead>
                        <tr>
                          <th>CloudID</th>
                          <th>Cloud Type</th>
                          <th>Provider</th>
                          <th>Request Name</th>
                          <th>Status</th>
                          <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tfoot>
                          <tr>
                          <th>CloudID</th>
                          <th>Cloud Type</th>
                          <th>Provider</th>
                          <th>Request Name</th>
                          <th>Status</th>
                          <th>Timestamp</th>
                        </tr>
                    </tfoot>
                    <tbody>
                      <tr *ngFor="let existingInfra of existingInfraList">
                          <td><a (click)="viewDetails(existingInfra.cloud_id)">{{existingInfra.cloud_id}}</a></td>
                          <td>{{existingInfra.cloud_type}}</td>
                          <td>{{existingInfra.provider}}</td>
                          <td>{{existingInfra.req_name}}</td>
                          <td>{{existingInfra.status}}</td>
                          <td>{{existingInfra.timestamp}}</td>
                      </tr>
                    </tbody>
                    </table>
                     <div class="box-content">
                      <div class="col-sm-6">
                       <div class="dataTables_info" id="datatable-3_info">Showing 1 to 20 entries</div></div>
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
                  </div>
              </div>
              <div class="modal" style="margin-top: 60px" 
              [ngClass]="{'show': showModal}" id="myModal" role="dialog">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close" (click)="hideModal()">
                      <span aria-hidden="true">&times;</span></button>
                      <h4 class="modal-title" id="myModalLabel">Cloud Details</h4>
                    </div>
                    <div class="modal-body">
                      <div *ngIf="viewDetailsFor">
                          Cloud ID is {{viewDetailsFor.cloud_id}}<br/>
                          Cloud Type is {{viewDetailsFor.cloud_type}}<br/>
                          Request Name is {{viewDetailsFor.req_name}}<br/>
                          Provider is {{viewDetailsFor.provider}}<br/>
                          Status says {{viewDetailsFor.status}}<br/>
                          Timestamp recorded: {{viewDetailsFor.time_stamp}}<br/>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-primary" data-dismiss="modal" (click)="hideModal()">Close</button>
                    </div>
                  </div>
                </div>
              </div>`
})
export class ExistingInfrastructureView {
  existingInfraList: ExistingInfrastructure[];
  showModal: boolean;
  viewDetailsFor: ExistingInfrastructure;

  constructor(private existingInfrastructureService: ExistingInfrastructureService) {
  this.showModal = false;
  this.viewDetailsFor = null;
}

  ngOnInit() {
    this.existingInfrastructureService.getExistingInfra().subscribe(
      data => {
        this.existingInfraList = data;
      },
      () => console.log('Finished')
    );
  }

  viewDetails(cloudId: string) {
    this.showModal = true;
    this.viewDetailsFor = _.find(this.existingInfraList, {'cloud_id': cloudId});
  }

  hideModal() {
    this.showModal = false;
    this.viewDetailsFor = null;
  }
}
