import { Component, NgZone, OnInit } from '@angular/core';
import { uniqBy } from 'lodash';
import { MailService } from '../mail.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mail-in',
  templateUrl: './mail-in.component.html',
  styleUrls: ['./mail-in.component.css'],
})
export class MailInComponent implements OnInit {

  public mailList: any = [];

  constructor(private zone: NgZone,
              private mailService: MailService) {
  }

  public ngOnInit() {
    this.mailService.getSocket()
      .on('mailIn', (message) => {
        console.info('message: ', message);

        this.mailList.unshift(message);
        this.mailList = uniqBy(this.mailList, 'messageId');

        this.zone.run(() => {
          console.log('enabled time travel');
        });
      });

    this.mailService.query('in')
      .subscribe((data) => {
        this.mailList = [...data.data.mails];
        console.info('this.mailList: ', this.mailList);
      });
  }
}
