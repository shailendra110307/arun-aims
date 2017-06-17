/**
 * Created by Rini Daniel on 1/27/2017.
 */
export class AppSettings {
    public static NEW_INFRASTRUCTURE_URL = 'http://api.cnet.com:5000/cluster/openstack/new/server';
  public static EXISTING_INFRASTRUCTURE_URL = './mock/existing-infrastructure.json';
  public static MONITORING_DATA_URL = './mock/monitoring-graph.json';
  public static MONITORING_ALERT_SUMMARY_URL = './mock/alert-summary.json';
  public static MONITORING_EVENT_SUMMARY_URL = './mock/event-summary.json';
  public static MONITORING_APPLICATION_INFO_URL = './mock/application-info.json';
  public static MONITORING_CONTAINER_SUMMARY_URL ='./mock/container-summary.json';
  public static MONITORING_DISKUTILITIES_SUMMARY_URL = './mock/diskutilities-summary.json';
  public static NEW_SERVICE_URL = 'http://api.cnet.com:5000/cluster/openstack/new/service';
  public static POST_IP_URL = './mock/monitoringip.json';
  public static GET_LOG_INSIGHT_URL = './mock/log-insight-get.json';
  public static POST_LOG_INSIGHT_URL = '';
  public static DATA_SET_MOCK = './mock/data-mock.json';
  public static MONITORING_APPLICATIONFACTS_INFO_URL = './mock/applicationfacts-info.json';
  public static MONITORING_APPLICATIONSTATUS_INFO_URL = './mock/applicationstatus-info.json';
  public static MONITORING_APPLICATIONSETTINGS_INFO_URL = './mock/applicationsettings-info.json';
  public static MONITORING_SERVERINFO_SUMMARY_URL = './mock/serverinfo-summary.json';
  public static MONITORING_SERVERFACTS_INFO_URL = './mock/serverfacts-info.json';
  public static MONITORING_PROCESSDETAILS_INFO_URL = './mock/processdetails-info.json';
  public static DATA_TOPO_MOCK = './mock/topo-data.json';
  public static PIE_DATA_MOCK = './mock/new-pie-data.json';
  public static ICON_PATH = './assets/img/'
  // './mock/monitoringip.json';
  // http://api.cnet.com:5000/cluster/openstack/get/ip?host={{host}}&duration={{duration}}
  // 'http://192.168.10.3:5000/mock/vmdata/{{host}}';http://192.168.20.137:5000/alerts?count=10
  // http://192.168.10.3:5000/mock/vmdata/{{host}} ./mock/monitoring-graph.json
  // 192.168.10.14 ./mock/monitoringip.json http://192.168.20.137:5000/mock/vmdata/{{host}}
}
