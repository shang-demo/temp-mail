import { Component, OnInit } from '@angular/core';
import { MailService } from '../mail.service';

@Component({
  selector: 'app-mail-send-history',
  templateUrl: './mail-send-history.component.html',
  styleUrls: ['./mail-send-history.component.css'],
})
export class MailSendHistoryComponent implements OnInit {
  public mailList: any = [];

  constructor(private mailService: MailService) {
  }

  public ngOnInit() {
    this.mailService.query('out')
      .subscribe((data) => {
        this.mailList = [...data.data.mails];
        console.info('this.mailList: ', this.mailList);
      });
  }

}
