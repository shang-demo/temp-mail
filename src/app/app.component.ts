/**
 * Angular 2 decorators and services
 */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AppState } from './app.service';
import {
  NavigationCancel, NavigationEnd,
  NavigationError, NavigationStart, Router,
} from '@angular/router';
import { NgProgressService } from 'ngx-progressbar';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss',
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {

  private sub: any;

  constructor(public appState: AppState,
              private router: Router,
              private ngProgressService: NgProgressService) {

    this.sub = this.router.events
      .subscribe(
        (event) => {
          if (event instanceof NavigationStart) {
            this.ngProgressService.begin();
          } else if (event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError) {
            this.ngProgressService.end();
          }
        },
        (error: any) => {
          console.warn(error);
          this.ngProgressService.end();
        });
  }

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

  public ngOnDestroy(): any {
    this.sub.unsubscribe();
  }
}

/**
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
