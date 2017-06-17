/**
 * Created by Rini Daniel on 1/6/2017.
 */
export class ExistingInfrastructure {
  cloud_id: string;
  cloud_type: string;
  provider: string;
  req_name: string;
  status: string;
  time_stamp: string;

  constructor() {
    this.cloud_id = '11980705-c742-49b4-8ef3-a2a5b39ee499';
    this.cloud_type = 'openstack';
    this.provider = 'openstack';
    this.req_name = '11980705-c742-49b4-8ef3-a2a5b39ee499';
    this.status = 'SUBMITTED';
    this.time_stamp = null;
  }
}
