import {NgModule, CUSTOM_ELEMENTS_SCHEMA}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {HttpModule, JsonpModule} from '@angular/http';
import {Ng2PaginationModule} from 'ng2-pagination';
import {AlertFilterPipe} from './common-components/alertfilter';
import {TooltipModule} from "ng2-tooltip";
import { LocalStorageModule } from 'angular-2-local-storage';

// import {ChartModule} from 'angular2-highcharts';

// import {NotificationBanner} from './common/notification-banner/notification-banner';
// import {MainMenu} from './common/main-menu/main-menu';
import {Content} from './content';
// import {NewServiceView} from './views/new-service';
// import {DashboardView} from './views/dashboard';
import {CnetMonitoringView} from './views/monitoring-cnet';
// import {NetworkDetails} from './new-infra-components/network-details/network-details';
// import {NewInfrastructureView} from './views/new-infrastructure';
// import {ExistingInfrastructureView} from './views/existing-infrastructure';
// import {MonitoringNewView} from './views/monitoring-new';
// import {MonitoringView} from './views/monitoring';
// import {MonitoringGraphView} from './monitoring-graphs/monitoring-graphs';
// import {IPMonitoringView} from './views/monitoring-ip';
// import {LogInsightView} from './views/log-insight';
// import {ImageDetails} from './new-infra-components/image-details/image-details';
// import {ClusterInformation} from './new-infra-components/cluster-information/cluster-information';
// import {GeneralDetails} from './new-infra-components/general-newdeployment-details/general-details';
// import {FirewallRules} from './new-infra-components/firewall-rules/firewall-rules';
// import {CloudAuthentication} from './new-infra-components/cloud-authentication/cloud-auth';
// import {PieChart} from './common-components/pie-chart';
import {ApplicationComponent} from './views/application-cnet';
import {ServerComponent} from './views/server-cnet';
import {PieComponent} from './common-components/pie.component';
import {LineComponent} from './common-components/line.component' ;
import {BarComponent} from './common-components/bar.component';
import {AreaComponent} from './common-components/area.component';
// import {SplineChart} from './common-components/spline-chart';
// import {FilterPieChart} from './common-components/filterpie-chart';
// import {D3AreaChart} from './common-components/d3-area-graph';
// import {AreaChart} from './common-components/area-chart';
// import {LineChart} from './common-components/line-chart';
// import {SimpleNotificationsModule} from 'angular2-notifications';
// import {WizzardComponent} from './common/form-wizzard/wizzard.component';
// import {SubscribeComponent} from './common-components/subscribe.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TopologyComponent } from './common-components/topology.component';

const appRoutes: Routes = [
  // {
  //   path: 'dashboard',
  //   component: DashboardView
  // },
  // {
  //   path: 'new-infrastructure',
  //   component: NewInfrastructureView
  // },
  // {
  //   path: 'existing-infrastructure',
  //   component: ExistingInfrastructureView
  // },
  {
    path: 'application-cnet',
    component: ApplicationComponent
  },
  {
    path: 'server-cnet/:id',
    component: ServerComponent
  },
  {
    path: 'server-cnet',
    component: ServerComponent
  },
  {
    path: 'widget-monitoring-cnet',
    component: CnetMonitoringView
  },
  {
    path: 'monitoring-cnet',
    component: CnetMonitoringView
  },
  // {
  //   path: 'widget-monitoring-new',
  //   component: MonitoringNewView
  // },
  // {
  //   path: 'monitoring-new',
  //   component: MonitoringNewView
  // },
  // {
  //   path: 'monitoring/:host',
  //   component: IPMonitoringView
  // },
  // {
  //   path: 'monitoring',
  //   component: MonitoringView
  // },
  // {
  //   path: 'widget-monitoring/:host',
  //   component: MonitoringNewView
  // },
  // {
  //   path: 'widget-monitoring',
  //   component: MonitoringView,
  // },
  // {
  //   path: 'log-insight/:host/:timestamp/:error_details',
  //   component: LogInsightView,
  // },
  // {
  //   path: 'log-insight',
  //   component: LogInsightView,
  // },
  // {
  //   path: 'widget-log-insight/:host/:timestamp/:error_details',
  //   component: LogInsightView,
  // },
  // {
  //   path: 'new-service',
  //   component: NewServiceView
  // },
  {
    path: '',
    redirectTo: '/widget-monitoring-cnet',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule, Ng2PaginationModule, TooltipModule, Daterangepicker, JsonpModule, RouterModule.forRoot(appRoutes, { useHash: true }),
  LocalStorageModule.withConfig({
            prefix: 'my-app',
            storageType: 'localStorage'
        })],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [Content, PieComponent, ApplicationComponent, ServerComponent, LineComponent,
  BarComponent, AreaComponent, CnetMonitoringView, TopologyComponent, AlertFilterPipe],
  bootstrap: [Content]
})
export class AppModule {
}
