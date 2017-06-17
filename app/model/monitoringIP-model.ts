/**
 * Created by  Rini Daniel on 2/3/2017.
 */
import * as _ from 'lodash';

    export class CpuUtilisation {
        cpu_idle_time: number;
        cpu_user_time: number;
        cpu_system_time: number;
        cpu_iowait_time: number;
        cpu_nicetime: number;
    }

    export class NetworkTraffic {
        network_id: string;
        incoming_network_traffic: number;
        outgoing_network_traffic: number;
    }

    export class Value {
        clock: number;
        ns: number;
        cpu_load: number;
        cpu_utilisation: CpuUtilisation;
        memory_usage: number;
        network_traffic: NetworkTraffic[];
    }

    export class Result {
        host_name: string;
        status: string;
        disk_space: number;
        disk_used: number;
        values: Value[];

        constructor() {
            this.values = [];
        }
    }

    export class MonitoringIP {
      result: Result;
      cpuLoad: any[];
      memoryUsage: any[];
      inputNetworkTraffic: any[];
      outputNetworkTraffic: any[];
      cpuUtilisationIdle: any[];
      cpuUtilisationUser: any[];
      cpuUtilisationSystem: any[];
      cpuUtilisationIOWait: any[];
      cpuUtilisationNiceTime: any[];

      constructor() {
        this.result = new Result();
        this.cpuLoad = [];
        this.memoryUsage = [];
        this.inputNetworkTraffic = [];
        this.outputNetworkTraffic = [];
        this.cpuUtilisationIdle = [];
        this.cpuUtilisationUser = [];
        this.cpuUtilisationSystem = [];
        this.cpuUtilisationIOWait = [];
        this.cpuUtilisationNiceTime = [];
      }

      setData(valuesToSet: Value[]) {
          const lastDate = new Date(_.get(_.last(this.result.values), 'clock', 0));
        _.each(valuesToSet, (valueToSet) => {
          const setDate = new Date(valueToSet.clock);
          if (setDate > lastDate) {
            this.result.values.push(valueToSet);
          }
        });

        this.result.values = _.takeRight(this.result.values, 50);

        this.getCpuLoad();
        this.getmemoryUsage();
        this.getnetworkTrafficInput();
        this.getnetworkTrafficOutput();
        this.getcpuUtilisationIdle();
        this.getcpuUtilisationIOWait();
        this.getcpuUtilisationNiceTime();
        this.getcpuUtilisationSystem();
        this.getcpuUtilisationUser();
      }

      get startDate(): Date {
        const firstDate = _.get(_.first(this.result.values), 'clock', new Date());
        return new Date(firstDate);
      }

      getCpuLoad() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.cpuLoad = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.cpu_load)
            };
          });
        } else {
          this.cpuLoad = [];
        }
      }

      getmemoryUsage() {
        if (this.result && !_.isEmpty(this.result.values)) {
        this.memoryUsage = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.memory_usage)
            };
          });
        } else {
          this.memoryUsage = [];
        }
      }

      getnetworkTrafficInput() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.inputNetworkTraffic = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.network_traffic[0].incoming_network_traffic)
            };
          });
        } else {
          this.inputNetworkTraffic = [];
        }
      }

      getnetworkTrafficOutput() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.outputNetworkTraffic = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.network_traffic[0].outgoing_network_traffic)
            };
          });
        } else {
          this.outputNetworkTraffic = [];
        }
      }

      getcpuUtilisationIdle() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.cpuUtilisationIdle = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.cpu_utilisation.cpu_idle_time)
            };
          });
        } else {
          this.cpuUtilisationIdle = [];
        }
      }

      getcpuUtilisationUser() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.cpuUtilisationUser = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.cpu_utilisation.cpu_user_time)
            };
          });
        } else {
          this.cpuUtilisationUser = [];
        }
      }

      getcpuUtilisationSystem() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.cpuUtilisationSystem = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.cpu_utilisation.cpu_system_time)
            };
          });
        } else {
          this.cpuUtilisationSystem = [];
        }
      }

      getcpuUtilisationIOWait() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.cpuUtilisationIOWait =  _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.cpu_utilisation.cpu_iowait_time)
            };
          });
        } else {
          this.cpuUtilisationIOWait = [];
        }
      }

      getcpuUtilisationNiceTime() {
        if (this.result && !_.isEmpty(this.result.values)) {
          this.cpuUtilisationNiceTime = _.map(this.result.values, function (value) {
            return {
              x: new Date(value.clock),
              y: _.toNumber(value.cpu_utilisation.cpu_nicetime)
            };
          });
        } else {
          this.cpuUtilisationNiceTime = [];
        }
      }
    }
