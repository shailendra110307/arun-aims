import {Component, Input} from '@angular/core';
import {Infrastructure} from '../../model/infrastructure-model';

@Component({
  selector: 'network-details',
  template: `<label class="col-sm-2 control-label">Override</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" 
                [(ngModel)]="infra.cluster_info.network_details.override">
                  <option>False</option>
                  <option>True</option>
                  </select>
              </div>
              <label class="col-sm-2 control-label">Private Network</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                [(ngModel)]="infra.cluster_info.network_details.private_net_name">
                  <option>private_net</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                  <option>FirefoxOS</option>
                </select>
              </div>
              <label class="col-sm-2 control-label">Public Network</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                [(ngModel)]="infra.cluster_info.network_details.public_net">
                  <option>public-net</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>
              <label class="col-sm-2 control-label">DNS</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                [(ngModel)]="infra.cluster_info.network_details.dns">
                  <option>8.8.8.8</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>
              <label class="col-sm-2 control-label">Create Floating</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                [(ngModel)]="infra.cluster_info.network_details.create_floating">
                  <option>True</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>`
})
export class NetworkDetails {
  @Input() infra: Infrastructure;
}

