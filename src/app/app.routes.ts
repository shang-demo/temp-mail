import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { MailInComponent } from './mail/mail-in/mail-in.component';
import { MailOutComponent } from './mail/mail-out/mail-out.component';
import { MailComponent } from './mail/mail.component';
import { MailSendHistoryComponent } from './mail/mail-send-history/mail-send-history.component';

export const ROUTES: Routes = [
  { path: '', redirectTo: 'mail', pathMatch: 'full' },
  { path: 'home', redirectTo: 'mail', pathMatch: 'full' },
  { path: 'mail', component: MailComponent },
  {
    path: 'mail/:shortId',
    component: MailComponent,
    children: [
      { path: 'in', component: MailInComponent },
      { path: 'out', component: MailOutComponent },
      { path: 'send-history', component: MailSendHistoryComponent },
    ],
  },
];
