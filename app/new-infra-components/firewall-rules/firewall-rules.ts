import {Component, Input} from '@angular/core';
import {Infrastructure} from '../../model/infrastructure-model';

@Component({
  selector: 'firewall-rules',
  template: `<label class="col-sm-2 control-label">ssh</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" 
                class="populate placeholder form-control">
                  <option>False</option>
                  <option>True</option>
                  </select>
              </div>
              <label class="col-sm-2 control-label">icmp</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control">
                  <option>private_net</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                  <option>FirefoxOS</option>
                </select>
              </div>
              <label class="col-sm-2 control-label">TCP</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control">
                  <option>public-net</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>
              <label class="col-sm-2 control-label">Port 22</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control">
                  <option>Allow</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>
              <label class="col-sm-2 control-label">Port 443</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control">
                  <option>Allow</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>
              <label class="col-sm-2 control-label">Port 80</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control">
                  <option>Allow</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                 </select>
              </div>`
})
export class FirewallRules {
  @Input() infra: Infrastructure;
}

