import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MailOutModel } from './mail-out-model';
import { MailService } from '../mail.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-mail-out',
  templateUrl: './mail-out.component.html',
  styleUrls: ['./mail-out.component.css'],
})
export class MailOutComponent implements OnInit {

  public saving: boolean;
  public mailOut: MailOutModel = new MailOutModel();

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private snackBar: MatSnackBar,
              private mailService: MailService) {

  }

  public ngOnInit() {
    this.activatedRoute.queryParams.subscribe(({ to }) => {
      this.mailOut.to = to;
    });

    let socket = this.mailService.getSocket();
    socket.on('mailOut', (data) => {
      console.info('mailOut: ', data);
      this.saving = false;
      this.snackBar.open(data.data.response);
      this.router.navigate(['../in'], { relativeTo: this.activatedRoute });
    });
  }

  public send() {
    if (!this.mailOut.to || !this.mailOut.subject || !this.mailOut.html) {
      this.snackBar.open('未填写完整, 请重新填写');
      return null;
    }
    this.saving = true;
    let socket = this.mailService.getSocket();
    socket.emit('mailOut', this.mailOut);
  }
}
