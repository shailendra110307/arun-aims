import * as _ from 'lodash';

export interface VmData {
  ip_address: string;
  hostname: string;
  status: string;
  provider: string;
  commission_date: Date;
  operating_system: string;
  image: string;
  usage: string;
}

export interface Project {
  name: string;
  vm_data: VmData[];
}

export class MonitoringGraph {
  datacenter: string;
  projects: Project[];
  usageDistribution: any;
  statusDistribution: any;
  providerDistribution: any;
  osDistribution: any;
  initialProjects: Project[];
  filters: any;
  filterIPDistribution: string[];

  get filterKeys(): Array<string> {
    return _.keys(this.filters);
  }

  get showUsageGraph(): boolean {
    return _.some(this.usageDistribution, function (o: any) {
      return o.y > 0;
    });
  }

  constructor() {
    this.filters = {};
  }

  setData(dataObj: any) {
    const dataModelObj: MonitoringGraph = <MonitoringGraph>dataObj;
    this.initialProjects = dataModelObj.projects;
    this.datacenter = dataModelObj.datacenter;
    this.callAllFunctions();
  }

  callAllFunctions() {
    this.applyFilter();
    this.setStatusDistribution();
    this.setProviderDistribution();
    this.setOsDistribution();
    this.setUsageDistribution();
    this.getIPDistribution();
  }

  setFilter(property: string, value: string) {
    if (!this.filters) {
      this.filters = {};
    }
    if (!_.isEmpty(value)) {
      this.filters[property] = value;
      this.callAllFunctions();
    } else if (_.has(this.filters, property)) {
      this.removeFilter(property);
    }
  }

  removeFilter(property: string) {
    this.filters = _.omit(this.filters, [property]);
    this.callAllFunctions();
  }

  clearFilter() {
    this.filters = {};
    this.callAllFunctions();
  }

  applyFilter() {
    this.projects = _.reduce(this.initialProjects || [], (memo: any, project: Project) => {
      return _.reduce(project.vm_data || [], (memo2: any, vmData: VmData) => {
        const isFiltered = _.isEmpty(this.filters) || _.every(_.keys(this.filters), (filterProperty: string) => {
          return vmData[filterProperty] === this.filters[filterProperty];
        });
        if (isFiltered) {
          memo2.push(_.extend({ 'project': project.name }, vmData));
        }
        return memo2;
      }, memo);
    }, []);
  }

  setStatusDistribution() {
    const initialValue: any[] = [
      { 'name': 'Active', 'y': null, 'color': '#4BD762' },
      { 'name': 'Error', 'y': null, 'color': '#FF402C' },
      { 'name': 'ShutDown', 'y': null, 'color': '#FFCA1F' }
    ];
    this.statusDistribution = this.setDistribution('status', initialValue);
  }

  setProviderDistribution() {
    const initialValue: any[] = [
      { 'name': 'Azure', 'y': null, 'color': '#278ECF' },
      { 'name': 'VMWare', 'y': null, 'color': '#D42AE8' },
      { 'name': 'AWS', 'y': null, 'color': '#FF9416' },
      { 'name': 'OpenStack', 'y': null, 'color': '#4BD762' }
    ];
    this.providerDistribution = this.setDistribution('provider', initialValue);
  }

  setOsDistribution(): any {
    const initialValue: any[] = [
      { 'name': 'Linux', 'y': null, 'color': '#D42AE8' },
      { 'name': 'Windows', 'y': null, 'color': '#4BD762' }
    ];
    this.osDistribution = this.setDistribution('operating_system', initialValue);
  }

  setUsageDistribution(): any {
    const initialValue: any[] = [
      { 'name': 'High', 'y': null, 'color': '#FF402C' },
      { 'name': 'Medium', 'y': null, 'color': '#FFCA1F' },
      { 'name': 'Low', 'y': null, 'color': '#4BD762' }
    ];
    this.usageDistribution = this.setDistribution('usage', initialValue);
  }

  setDistribution(forProperty: string, initialValue: any = []) {
    const reducedObject = _.reduce(this.projects || [], function (memo, vmData) {
      const propertyItem: any = _.find(memo, ['name', vmData[forProperty]]);

      if (propertyItem) {
        propertyItem.y++;
      }
      return memo;
    }, initialValue);
    return reducedObject;
  }

  getIPDistribution(): any {
    if (_.isEmpty(this.filters)) {
      return this.filterIPDistribution = undefined;
    } else {
    const reducedObject: any[] = _.reduce(this.projects || [], function (memo2: any, vmData: any) {
        memo2.push(vmData.ip_address);
        return memo2;
    }, []);
    return this.filterIPDistribution = reducedObject;
  }
  }
}
