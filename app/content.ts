import {Component } from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import * as _ from 'lodash';
declare var $: JQueryStatic;

@Component({
  selector: 'content',
  template: `<div class="container-fluid" [ngClass]="{'widget-body':isWidget}">
  <div class="main_container">
      <main-menu *ngIf="!isWidget"></main-menu>
  
      <div [ngClass]="{'right_col':!isWidget}" role="main">
        <div class="">
          <router-outlet></router-outlet>
        </div>
      </div>
  </div>
</div>`
})
export class Content {
  isWidget: boolean;
  constructor(private router: Router) {
    this.isWidget = true;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (_.startsWith(val.url, '/widget')) {
          this.isWidget = true;
          $('body').addClass('isWidget');
        } else {
          this.isWidget = false;
          $('body').removeClass('isWidget');
        }
      }
    });
  }
}
