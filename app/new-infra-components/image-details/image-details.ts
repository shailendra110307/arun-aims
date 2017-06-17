import {Component, Input} from '@angular/core';
import {Infrastructure} from '../../model/infrastructure-model';

@Component({
  selector: 'image-details',
  template: `<label class="col-sm-2 control-label">Image</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.cluster_info.image_details.image">
                  <option>Ubuntu 14.04</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                  </select>
              </div>
              <label class="col-sm-2 control-label">Key Name</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" [(ngModel)]="infra.cluster_info.image_details.key_name">
                  <option>Centos</option>
                  <option>Windows</option>
                  <option>OpenSolaris</option>
                  </select>
              </div>
              <label class="col-sm-2 control-label">Key Create</label>
              <div class="col-sm-4">
                <select id="s2_with_tag" class="populate placeholder form-control" 
                [(ngModel)]="infra.cluster_info.image_details.key_create">
                  <option>True</option>
                  <option>False</option>
                  </select>
              </div>`
})
export class ImageDetails {
  @Input() infra: Infrastructure;
}

