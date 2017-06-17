import {Component, Input} from '@angular/core';
import {Infrastructure} from '../../model/infrastructure-model';

@Component({
  selector: 'general-details',
  template: `<label class="col-sm-2 control-label">Provider</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.provider">
                  <option>Open Stack</option>
                  <option>VM Ware</option>
                </select>
              </div>
              <label class="col-sm-2 control-label">Zone</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.zone">
                  <option>Default</option>
                  <option>Zone1</option>
                  <option>Zone2</option>
                  <option>Zone3</option>
                </select>
              </div>
              <!--yet to add a functionality &#45;&#45; If VM Ware is selected &#45;&#45; Region should be hidden-->
              <label class="col-sm-2 control-label">Region</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.region">
                  <option>RegionOne</option>
                  <option>RegionTwo</option>
                  <option>RegionThree</option>
                  <option>RegionFour</option>
                </select>
              </div>
              <label class="col-sm-2 control-label">Role</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.role">
                  <option>Database</option>
                  <option>Web Server</option>
                  <option>Test</option>
                </select>
              </div>
              <!-- free text for name-->
              <label class="col-sm-2 control-label">Name</label>
              <div class="col-sm-4">
                <input type="text" class="form-control" placeholder="Name" [(ngModel)]="infra.name" >
              </div>`
})
export class GeneralDetails {
  @Input() infra: Infrastructure;
}

