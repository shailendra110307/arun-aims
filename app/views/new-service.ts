import {Component} from '@angular/core';
import {NewService} from '../services/newService-service';
import {NewServiceModel} from '../model/newService-model';
import {NotificationsService} from 'angular2-notifications';
import {Router} from '@angular/router';

@Component({
  providers: [NewService, NotificationsService],
  template: `<div class="box-content">
                 <h4 class="page-header">New Service request</h4>
                        <table class="table table-bordered table-striped table-hover table-heading table-datatable dataTable" >
                            <thead>
                              <tr>
                                <th>Service</th>
                                <th>Version</th>
                                <th>Action</th>
                                <th>OS Details</th>
                                <th>Release</th>
                                <th>Options</th>
                                <th>Options</th>
                              </tr>
                           </thead>
                           <tfoot>
                              <tr>
                                <th>Service</th>
                                <th>Version</th>
                                <th>Action</th>
                                <th>OS Details</th>
                                <th>Release</th>
                                <th>Options</th>
                                <th>Options</th>
                              </tr>
                           </tfoot>
                           <tbody>
                            <tr *ngFor="let newService of newServiceList; let i=index">
                                <td>{{newService.service}}</td>
                                <td>{{newService.version}}</td>
                                <td>{{newService.action}}</td>
                                <td>{{newService.os}}</td>
                                <td>{{newService.release}}</td>
                                <td><a (click)="edit(i)">Edit/Details</a></td>
                                <td><a (click)="delete(i)">Delete</a></td>
                             </tr>
                           </tbody>
                     </table>
                     <div class="modal" style="margin-top: 60px" 
                      [ngClass]="{'show': showModal}" id="myModal" role="dialog">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close" (click)="hideModal()">
                              <span aria-hidden="true">&times;</span></button>
                              <h4 class="modal-title" id="myModalLabel">New Service</h4>
                            </div>
                            <div class="modal-body">
                              <div class="form-group" *ngIf="newServiceList.length">
                                   <label class="col-md-3 control-label">Service Name</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" [(ngModel)]="newServiceList[updatingIndex].service" 
                                            name="service"/>
                                       </div>
                                   <label class="col-md-3 control-label">Version</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" [(ngModel)]="newServiceList[updatingIndex].version" 
                                            name="version"/>
                                       </div>
                                   <label class="col-md-3 control-label">Action</label>
                                       <div class="col-md-3">
                                       <select class="populate placeholder form-control" [(ngModel)]="newServiceList[updatingIndex].action" 
                                       name="action">
                                            <option>Install</option>
                                            <option>Uninstall</option>
                                            <option>Pause</option>
                                            <option>Shutdown</option>
                                       </select>
                                       </div>
                                   <label class="col-md-3 control-label">OS Details</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" [(ngModel)]="newServiceList[updatingIndex].os"
                                             name="os"/>
                                       </div>
                                   <label class="col-md-3 control-label">Release</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" [(ngModel)]="newServiceList[updatingIndex].release"
                                             name="release"/>
                                       </div>
                                   <label class="col-md-3 control-label">Package Type</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" 
                                            [(ngModel)]="newServiceList[updatingIndex].license_info.package_type" 
                                            name="package"/>
                                       </div>
                                   <label class="col-md-3 control-label">Issuer</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" 
                                            [(ngModel)]="newServiceList[updatingIndex].license_info.issuer" 
                                            name="issuer"/>
                                       </div>
                                   <label class="col-md-3 control-label">Key</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" 
                                            [(ngModel)]="newServiceList[updatingIndex].license_info.key" 
                                            name="key"/>
                                       </div>
                                   <label class="col-md-3 control-label">Start Date</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control"
                                             [(ngModel)]="newServiceList[updatingIndex].license_info.start_date" 
                                            name="startdate"/>
                                       </div>
                                   <label class="col-md-3 control-label">End Date</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control" 
                                            [(ngModel)]="newServiceList[updatingIndex].license_info.end_date" 
                                            name="enddate"/>
                                       </div>
                                   <label class="col-md-3 control-label">Project</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control"
                                             [(ngModel)]="newServiceList[updatingIndex].vm_info.project" 
                                            name="project"/>
                                       </div>
                                   <label class="col-md-3 control-label">Role</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control"
                                             [(ngModel)]="newServiceList[updatingIndex].vm_info.role" 
                                            name="role"/>
                                       </div>
                                   <label class="col-md-3 control-label">VM List</label>
                                       <div class="col-md-3">
                                            <input type="text" class="form-control"
                                             [(ngModel)]="newServiceList[updatingIndex].vm_info.vm_list" 
                                            name="vmlist"/>
                                       </div>
                             </div>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-primary" data-dismiss="modal" (click)="hideModal()">Close</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    <button (click)="addRow()" class="btn btn-default btn-label">Add New Service</button>
                    <button (click)="onSubmit()" class="btn btn-default btn-label">Submit</button>
                </div>`
})
export class NewServiceView {
  newServiceList: NewServiceModel[];
  updatingIndex: number;
  showModal: boolean;
  options = {
    timeOut: 5000,
    lastOnBottom: true,
    clickToClose: true,
    maxLength: 0,
    maxStack: 7,
    showProgressBar: true,
    pauseOnHover: true,
    preventDuplicates: false,
    preventLastDuplicates: 'visible',
    rtl: false,
    animate: 'scale',
    position: ['right', 'bottom']
  };

  constructor(private newServiceInstance: NewService, private notificationService: NotificationsService,
              private router: Router) {
    this.newServiceList = [];
    this.updatingIndex = 0;
  }

  onSubmit() {
    this.newServiceInstance.postNewRequest(this.newServiceList)
      .subscribe(
        data => this.router.navigateByUrl('/existing-infrastructure'),
        error => this.notificationService.error('Failed', error),
        () => console.log('Finished')
      );
  }

  addRow() {
    const initialService = new NewServiceModel();
    this.newServiceList.push(initialService);
    this.updatingIndex = (this.newServiceList.length - 1);
    this.showModal = true;
  }

  edit(index: number) {
    this.updatingIndex = index;
    this.showModal = true;
  }
  delete(index: number) {
    this.updatingIndex = index;
    this.newServiceList.splice(this.updatingIndex, 1);
  }
  hideModal() {
    this.showModal = false;
  }
}

