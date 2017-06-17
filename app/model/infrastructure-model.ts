export class Infrastructure {
    name: string;
    provider: string;
    zone: string;
    region: string;
    role: string;
    cloud_auth: CloudAuthorization;
    cluster_info: ClusterInformation;

  constructor() {
    this.provider = 'openstack';
    this.zone = 'default';
    this.region = 'RegionOne';
    this.role = 'db';
    this.cloud_auth = new CloudAuthorization();
    this.cluster_info = new ClusterInformation();
  }
}

export class CloudAuthorization {
  auth_url: string;
  username: string;
  password: string;
  tenant_name: string;
  region: string;
  identity_version: string;

  constructor() {
    this.auth_url = 'http://192.168.20.208:5000/v2.0';
    this.username = 'admin';
    this.password = 'cnetopenstack';
    this.tenant_name = 'css_deploy';
    this.region = 'RegionOne';
    this.identity_version = 'v2';
  }
}

export class ClusterInformation {
  count: string;
  name: string;
  flavor_details: FlavorDetails;
  image_details: ImageDetails;
  network_details: NetworkDetails;
  // firewall_rules: FirewallRules;

  constructor() {
    this.count = '2';
    this.name = 'sample';
    this.flavor_details = new FlavorDetails();
    this.image_details = new ImageDetails();
    // this.firewall_rules = new FirewallRules();
    this.network_details = new NetworkDetails();
  }
}

export class FlavorDetails {
  flavor: string;
  override: string;
  create: string;
  name: string;
  vcpus: string;
  ram: string;
  disk: string;

  constructor() {
    this.flavor = 'm1.small';
    this.override = 'Yes';
    this.create = 'No';
    this.name = 'm1.small';
    this.vcpus = '2';
    this.ram = '4GB';
    this.disk = '40GB';
  }
}

export class ImageDetails {
  image: string;
  key_name: string;
  key_create: string;

  constructor() {
    this.image = 'Ubuntu 14.04';
    this.key_name = 'centos';
    this.key_create = 'True';
  }
}

export class NetworkDetails {
  override: string;
  public_net: string;
  private_net_name: string;
  dns: string;
  create_floating: string;

  constructor() {
    this.override = 'False';
    this.public_net = 'public-net' ;
    this.private_net_name = 'private-net';
    this.dns = '8.8.8.8';
    this.create_floating = 'True';
  }
}

/*class FirewallRules {
  ssh: string;
  icmp: string;
  tcp: string;
  ports: FirewallPorts;

  constructor() {
    this.ssh = 'True';
    this.icmp = 'True';
    this.tcp = 'True';
    this.ports = new FirewallPorts();
  }
}*/

/*
class FirewallPorts {
  '22': string;
  '443': string;
  '80': string;

  constructor() {
    this['22'] = 'Allow';
    this['443'] = 'Allow';
    this['80'] = 'Allow';
  }
*/

