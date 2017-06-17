import { Component } from '@angular/core';
declare function init_sidebar(): void;
declare function find_sidebar(): void;

@Component({
  selector: 'main-menu',
  template: `<div class="col-md-3 left_col">
  <div class="left_col scroll-view">
    <div class="navbar nav_title" style="border: 0;">
      <a [routerLink]="['/dashboard']" class="site_title"><img src="./assets/images/logo.png" alt="AIMS"
                                                      class="img-circle logo-img"/> <span>AIMS</span></a>
    </div>

    <div class="clearfix"></div>

    <!-- menu profile quick info -->
    <div class="profile clearfix">
      <div class="profile_pic">
        <img src="./assets/images/img.jpg" alt="..." class="img-circle profile_img">
      </div>
      <div class="profile_info">
        <span>Welcome,</span>
        <h2>John Doe</h2>
      </div>
    </div>
    <!-- /menu profile quick info -->

    <br/>

    <!-- sidebar menu -->
    <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
      <div class="menu_section">
        <h3>General</h3>
        <ul class="nav side-menu">
          <li><a [routerLink]="['/dashboard']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"><i
            class="fa fa-dashboard"></i> Dashboard</a>
          </li>
          <li><a><i class="fa fa-desktop"></i> Orchestration <span class="fa fa-chevron-down"></span></a>
            <ul class="nav child_menu">
              <li><a>Infrastructure<span class="fa fa-chevron-down"></span></a>
                <ul class="nav child_menu">
                  <li class="sub_menu"><a  [routerLink]="['/new-infrastructure']">New</a>
                  </li>
                  <li><a [routerLink]="['/existing-infrastructure']">Existing</a>
                  </li>
                </ul>
              </li>
              <li><a>Service<span class="fa fa-chevron-down"></span></a>
                <ul class="nav child_menu">
                  <li class="sub_menu"><a>Web Server</a>
                  </li>
                  <li><a>Database Server</a>
                  </li>
                  <li><a routerLink="/new-service">New Service</a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li><a><i class="fa fa-sitemap"></i> Discovery <span class="fa fa-chevron-down"></span></a>
            <ul class="nav child_menu">
              <li>
                <a href="#">Infrastructure Discovery</a>
              </li>
              <li><a href="#">Service Discovery</a>
              </li>
            </ul>
          </li>
          <li><a routerLink="/monitoring" routerLinkActive="active" class="ajax-link"><i class="fa fa-pencil-square-o"></i> Monitoring</a>
          </li>
          <li><a><i class="fa fa-bar-chart-o"></i> Reporting </a>
          </li>
          <li><a routerLink="/log-insight" routerLinkActive="active" class="ajax-link"><i class="fa fa-calendar"></i>Log Insight</a></li>
        </ul>
      </div>
    </div>
    <!-- /sidebar menu -->

    <!-- /menu footer buttons -->
    <div class="sidebar-footer hidden-small">
      <a data-toggle="tooltip" data-placement="top" title="Settings">
        <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
      </a>
      <a data-toggle="tooltip" data-placement="top" title="FullScreen">
        <span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>
      </a>
      <a data-toggle="tooltip" data-placement="top" title="Lock">
        <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
      </a>
      <a data-toggle="tooltip" data-placement="top" title="Logout" href="login.html">
        <span class="glyphicon glyphicon-off" aria-hidden="true"></span>
      </a>
    </div>
    <!-- /menu footer buttons -->
  </div>
</div>

<!-- top navigation -->
<div class="top_nav">
  <div class="nav_menu">
    <nav>
      <div class="nav toggle">
        <a id="menu_toggle"><i class="fa fa-bars"></i></a>
      </div>

      <ul class="nav navbar-nav navbar-right">
        <li class="">
          <a href="javascript:;" class="user-profile">
            <span notification-banner></span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</div>`
})
export class MainMenu  {
  ngAfterViewInit() {
    find_sidebar();
    init_sidebar();
  }
}
