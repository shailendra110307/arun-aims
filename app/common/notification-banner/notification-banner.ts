import { Component } from '@angular/core';

@Component({
  selector: '[notification-banner]',
  template: `<span class="label label-default" style="margin-left: 15px">
             <i class="fa fa-warning"></i> Server maintenance scheduled for 12/24 (Saturday) @ 5 PM CST</span>`
})
export class NotificationBanner  {}

