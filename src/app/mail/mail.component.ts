import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MailService } from './mail.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss'],
})
export class MailComponent implements OnInit {

  public shortId: string;
  public mailDomain: string = MAIL_DOMAIN;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private mailService: MailService) {
  }

  public ngOnInit() {
    console.info('===============: ', MAIL_DOMAIN);

    this.activatedRoute.params.subscribe((params) => {
      if (!params.shortId) {
        console.info('params.shortId1: ', params.shortId);
        this.router.navigate(['/mail', 'test']);
      } else {
        console.info('params.shortId2: ', params.shortId);
        this.shortId = params.shortId;
        this.mailService.setShortId(this.shortId);
        this.router.navigate([`/mail/${params.shortId}/in`]);
      }
    });
  }

}
