import {Component, Input} from '@angular/core';
import {Infrastructure} from '../../model/infrastructure-model';

@Component({
  selector: 'cloud-auth',
  template: `<label class="col-sm-2 control-label">Auth URL</label>
                <div class="col-sm-4">
                  <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.cloud_auth.auth_url">
                    <option>URL1</option>
                    <option>URL2</option>
                    <option>URL3</option>
                  </select>
                  <!--"http://192.168.20.208:5000/v2.0",admin,cnetopenstack-->
                </div>
                    <label class="col-sm-2 control-label">User Name</label>
                    <div class="col-sm-4">
                      <input type="text" class="form-control" placeholder="User name"  
                      [(ngModel)]="infra.cloud_auth.username">
                    </div>
                    <label class="col-sm-2 control-label">Password</label>
                    <div class="col-sm-4">
                      <input type="text" class="form-control" placeholder="Password" 
                      [(ngModel)]="infra.cloud_auth.password">
                    </div>
                <label class="col-sm-2 control-label">Tenant Name</label>
                <div class="col-sm-4">
                  <select id="s2_with_tag" class="populate placeholder form-control" 
                  [(ngModel)]="infra.cloud_auth.tenant_name" >
                    <option>css_deploy</option>
                    <option>Windows</option>
                    <option>OpenSolaris</option>
                  </select>
                </div>
                <label class="col-sm-2 control-label">Region</label>
                <div class="col-sm-4">
                  <select id="s2_with_tag" class="populate placeholder form-control"
                  [(ngModel)]="infra.cloud_auth.region">
                    <option>RegionOne</option>
                    <option>Region2</option>
                    <option>Region3</option>
                  </select>
                </div>
                <label class="col-sm-2 control-label">Identity Version</label>
                <div class="col-sm-4">
                  <select id="s2_with_tag" class="populate placeholder form-control"
                  [(ngModel)]="infra.cloud_auth.identity_version">
                    <option>v2</option>
                    <option>Windows</option>
                    <option>OpenSolaris</option>
                  </select>
                </div>`
})
export class CloudAuthentication {
  @Input() infra: Infrastructure;
}

