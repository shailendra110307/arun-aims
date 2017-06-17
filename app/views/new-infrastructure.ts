import {Component} from '@angular/core';
import {InfrastructureService} from '../services/infrastructure-service';
import {Infrastructure} from '../model/infrastructure-model';
import {NotificationsService} from 'angular2-notifications';
import {Router} from '@angular/router';
declare function DashboardTabChecker(): void;

@Component({
  providers: [InfrastructureService],
  styles: [`.wizard {
    margin: 20px auto;
    background: #fff;
}

    .wizard .nav-tabs {
        position: relative;
        margin: 40px auto;
        margin-bottom: 0;
        border-bottom-color: #e0e0e0;
    }

    .wizard > div.wizard-inner {
        position: relative;
    }

.connecting-line {
    height: 2px;
    background: #e0e0e0;
    position: absolute;
    width: 80%;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 50%;
    z-index: 1;
}

.wizard .nav-tabs > li.active > a, .wizard .nav-tabs > li.active > a:hover, .wizard .nav-tabs > li.active > a:focus {
    color: #555555;
    cursor: default;
    border: 0;
    border-bottom-color: transparent;
}

span.round-tab {
    width: 70px;
    height: 70px;
    line-height: 70px;
    display: inline-block;
    border-radius: 100px;
    background: #fff;
    border: 2px solid #e0e0e0;
    z-index: 2;
    position: absolute;
    left: 0;
    text-align: center;
    font-size: 25px;
}
span.round-tab i{
    color:#555555;
}
.wizard li.active span.round-tab {
    background: #fff;
    border: 2px solid #5bc0de;
    
}
.wizard li.active span.round-tab i{
    color: #5bc0de;
}

span.round-tab:hover {
    color: #333;
    border: 2px solid #333;
}

.wizard li:after {
    content: " ";
    position: absolute;
    left: 46%;
    opacity: 0;
    margin: 0 auto;
    bottom: 0px;
    border: 5px solid transparent;
    border-bottom-color: #5bc0de;
    transition: 0.1s ease-in-out;
}

.wizard li.active:after {
    content: " ";
    position: absolute;
    left: 46%;
    opacity: 1;
    margin: 0 auto;
    bottom: 0px;
    border: 10px solid transparent;
    border-bottom-color: #5bc0de;
}

.wizard .nav-tabs > li a {
    width: 70px;
    height: 70px;
    margin: 20px auto;
    border-radius: 100%;
    padding: 0;
}

    .wizard .nav-tabs > li a:hover {
        background: transparent;
    }

.wizard .tab-pane {
    position: relative;
    padding-top: 50px;
}

.wizard h3 {
    margin-top: 0;
}

@media( max-width : 585px ) {

    .wizard {
        width: 90%;
        height: auto !important;
    }

    span.round-tab {
        font-size: 16px;
        width: 50px;
        height: 50px;
        line-height: 50px;
    }

    .wizard .nav-tabs > li a {
        width: 50px;
        height: 50px;
        line-height: 50px;
    }

    .wizard li.active:after {
        content: " ";
        position: absolute;
        left: 35%;
    }
}`],
  template: `<div class="row">
                <div id="breadcrumb" class="col-xs-12">
                  <ol class="breadcrumb">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="#">Orchestration</a></li>
                    <li><a href="#">Infrastructure</a></li>
                    <li><a href="#">New Infrastructure</a></li>
                  </ol>
                </div>
              </div>
              <!--Start Dashboard 1-->
              <div class="x_panel">
                  <div class="x_title">
                    <h2 id="new-deployment-header">Create a New Infrastructure</h2>
                    <div class="clearfix"></div>
                  </div>
                  <div class="x_content">
          <div class="wizard">
            <div class="wizard-inner">
                <div class="connecting-line"></div>
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" id="general_details_tab" class="active" style="width:20%">
                        <a href="#step1" data-toggle="tab" role="tab" title="General Details" 
                          (click)="nextClicked($event, 'general_details')">
                            <span class="round-tab">
                                <i class="glyphicon glyphicon-info-sign"></i>
                            </span>
                        </a>
                    </li>

                    <li role="presentation" id="cluster_information_tab" style="width:20%">
                        <a href="#step2" data-toggle="tab" role="tab" title="Cluster Information" 
                          (click)="nextClicked($event, 'cluster_information')">
                            <span class="round-tab">
                                <i class="glyphicon glyphicon-th"></i>
                            </span>
                        </a>
                    </li>
                    <li role="presentation" id="cloud_authentication_tab" style="width:20%">
                        <a href="#step3" data-toggle="tab" role="tab" title="Cloud Authentication" 
                          (click)="nextClicked($event, 'cloud_authentication')">
                            <span class="round-tab">
                                <i class="glyphicon glyphicon-cloud"></i>
                            </span>
                        </a>
                    </li>

                    <li role="presentation" id="image_details_tab" style="width:20%">
                        <a href="#complete" data-toggle="tab" role="tab" title="Image Details"
                          (click)="nextClicked($event, 'image_details')">
                            <span class="round-tab">
                                <i class="glyphicon glyphicon-certificate"></i>
                            </span>
                        </a>
                    </li>

                    <li role="presentation" id="network_details_tab" style="width:20%">
                        <a href="#complete" data-toggle="tab" role="tab" title="Network Details" 
                          (click)="nextClicked($event, 'network_details')">
                            <span class="round-tab">
                                <i class="glyphicon glyphicon-transfer"></i>
                            </span>
                        </a>
                    </li>
                </ul>
            </div>

            <form class="form-horizontal" role="form">
                <div class="tab-content">
                    <div class="tab-pane active" role="tabpanel" id="general_details">
                        <h3>General Details</h3>
                        <div class="form-group">
                         <general-details [(infra)]="infra"></general-details>
                        </div>
                        <ul class="list-inline pull-right">
                            <li><button type="button" class="btn btn-primary next-step"
                             (click)="nextClicked($event, 'cluster_information')">Save and continue</button></li>
                        </ul>
                    </div>
                    <div class="tab-pane" role="tabpanel" id="cluster_information">
                        <h3>Cluster Information</h3>
                         <div class="form-group">
                         <cluster-information [(infra)]="infra"></cluster-information>
                         </div>
                        <ul class="list-inline pull-right">
                            <li><button type="button" class="btn btn-default prev-step" 
                                    (click)="nextClicked($event, 'general_details')">Previous</button></li>
                            <li><button type="button" class="btn btn-primary next-step" 
                                    (click)="nextClicked($event, 'cloud_authentication')">Save and continue</button></li>
                        </ul>
                    </div>
                    <div class="tab-pane" role="tabpanel" id="cloud_authentication">
                        <h3>Cloud Authentication</h3>
                         <div class="form-group">
                         <cloud-auth [(infra)]="infra"></cloud-auth>
                         </div>

                        <ul class="list-inline pull-right">
                            <li><button type="button" class="btn btn-default prev-step" 
                                    (click)="nextClicked($event, 'cluster_information')">Previous</button></li>
                            <li><button type="button" class="btn btn-primary next-step" 
                                    (click)="nextClicked($event, 'image_details')">Save and continue</button></li>
                        </ul>
                    </div>
                    <div class="tab-pane" role="tabpanel" id="image_details">
                        <h3>Image Details</h3>
                         <div class="form-group">
                         <image-details [(infra)]="infra"></image-details>
                         </div>

                        <ul class="list-inline pull-right">
                            <li><button type="button" class="btn btn-default prev-step" 
                                    (click)="nextClicked($event, 'cloud_authentication')">Previous</button></li>
                            <li><button type="button" class="btn btn-primary next-step" 
                                    (click)="nextClicked($event, 'network_details')">Save and continue</button></li>
                        </ul>
                    </div>
                    <div class="tab-pane" role="tabpanel" id="network_details">
                        <h3>Network Details</h3>
                         <div class="form-group">
                         <network-details [(infra)]="infra"></network-details>
                         </div>

                        <ul class="list-inline pull-right">
                            <li><button type="button" class="btn btn-default prev-step" 
                                    (click)="nextClicked($event, 'image_details')">Previous</button></li>
                            <li><button type="button" class="btn btn-primary next-step" 
                                    (click)="onSubmit($event)">Save</button></li>
                        </ul>
                    </div>
                    <div class="clearfix"></div>
                </div>
            </form>
          </div>
          </div>
          </div>
               <simple-notifications [options]="options"></simple-notifications>`
})
export class NewInfrastructureView {
  infra: Infrastructure;
  options = {
    timeOut: 5000,
    lastOnBottom: true,
    clickToClose: true,
    maxLength: 0,
    maxStack: 7,
    showProgressBar: true,
    pauseOnHover: true,
    preventDuplicates: false,
    preventLastDuplicates: 'visible',
    rtl: false,
    animate: 'scale',
    position: ['right', 'bottom']
  };

  constructor(private infrastructureService: InfrastructureService, private notificationService: NotificationsService,
              private router: Router) {
  }

  ngOnInit() {
    this.infra = new Infrastructure();
    (<any>$('.nav-tabs > li a[title]')).tooltip();
  }

  nextClicked(e: any, id: string) {
    // alert(JSON.stringify(this.infra));
    e.preventDefault();
    e.stopPropagation();
    $('.wizard .tab-pane.active').removeClass('active');
    $('.wizard .nav-tabs li.active').removeClass('active');
    $('.wizard #' + id).addClass('active');
    $('.wizard #' + id + '_tab').addClass('active');
    return false;
  }

  onSubmit() {
    this.infrastructureService.postNewInfra(this.infra)
      .subscribe(
        data => this.router.navigateByUrl('/existing-infrastructure'),
        error => this.notificationService.error('Failed', error),
        () => console.log('Finished')
      );
  }
}

