/**
 * Created by Rini Daniel on 1/19/2017.
 */
export class LicenseInfo {
  package_type: string;
  issuer: string;
  key: string;
  start_date: string;
  end_date: string;
}

export class VmInfo {
  project: string;
  role: string;
  vm_list: string[];

  constructor() {
    this.vm_list = [];
    this.vm_list.push('');
  }
}

export class NewServiceModel {
  service: string;
  version: string;
  action: string;
  os: string;
  release: string;
  license_info: LicenseInfo;
  vm_info: VmInfo;

  constructor() {
    this.license_info = new LicenseInfo();
    this.vm_info = new VmInfo();
  }
}


