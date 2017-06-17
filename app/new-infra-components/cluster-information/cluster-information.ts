import {Component, Input} from '@angular/core';
import {Infrastructure} from '../../model/infrastructure-model';

@Component({
  selector: 'cluster-information',
  template: ` <label class="col-sm-2 control-label">Name</label>
              <div class="col-sm-4">
                <input type="text" class="form-control" placeholder="Name" [(ngModel)]="infra.cluster_info.name">
              </div>
              <label class="col-sm-2 control-label">Count</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.cluster_info.count">
                  <option>5</option>
                  <option>10</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
              <label class="col-sm-2 control-label">Flavor</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" 
                  [(ngModel)]="infra.cluster_info.flavor_details.flavor">
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>
                <!--<select id="s2_with_tag" class="populate placeholder form-control"-->
                  <!--[(ngModel)]="infra.cluster_info.flavor_details.override">-->
                  <!--<option>False</option>-->
                  <!--<option>True</option>-->
                  <!--</select>-->
              
              <!---->
                <!--<select id="s2_with_tag" class="populate placeholder form-control"-->
                  <!--[(ngModel)]="infra.cluster_info.flavor_details.create">-->
                  <!--<option>True</option>-->
                  <!--<option>False</option>-->
                  <!--</select>-->
              
              <label class="col-sm-2 control-label">Flavour Name</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                  [(ngModel)]="infra.cluster_info.flavor_details.name">
                  <option>m1.tiny</option>
                  <option>m1.small</option>
                  <option>m1.medium</option>
                  <option>m1.large</option>
                  <option>m1.xlarge</option>
                  </select>
              </div>
              <label class="col-sm-2 control-label">VCPUs</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                  [(ngModel)]="infra.cluster_info.flavor_details.vcpus">
                  <option>2</option>
                  <option>4</option>
                  <option>6</option>
                  <option>8</option>
                </select>
              </div>
              <label class="col-sm-2 control-label">RAM</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                  [(ngModel)]="infra.cluster_info.flavor_details.ram">
                  <option>512MB</option>
                  <option>2GB</option>
                  <option>4GB</option>
                  <option>8GB</option>
                  <option>16GB</option>
                 </select>
              </div>
             <label class="col-sm-2 control-label">Disk</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control"
                    [(ngModel)]="infra.cluster_info.flavor_details.disk">
                  <option>20GB</option>
                  <option>40GB</option>
                  <option>80GB</option>
                 </select>
              </div>
              <label class="col-sm-2 control-label">Override</label>
              <div class="col-sm-4">
                 <select id="s2_with_tag" class="populate placeholder form-control"
                    [(ngModel)]="infra.cluster_info.flavor_details.override">
                  <option>Yes</option>
                  <option>No</option>
                 </select>
               </div>
              <label class="col-sm-2 control-label">Create</label>
              <div class="col-sm-4">
                 <select id="s2_with_tag" class="populate placeholder form-control"
                    [(ngModel)]="infra.cluster_info.flavor_details.create">
                  <option>Yes</option>
                  <option>No</option>
                 </select>
               </div>`
})
export class ClusterInformation {
  @Input() infra: Infrastructure;
}

