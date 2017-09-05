import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./home.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html',
})

export class HomeComponent implements OnInit {

  public location = window.location;

  constructor(private homeService: HomeService) {
  }

  public ngOnInit() {
    console.log('hello `Home` component');

    this.homeService.search()
      .subscribe(({ data }) => {
        console.info('data: ', data.version.env);
      });
  }
}
