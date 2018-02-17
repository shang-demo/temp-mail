import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailSendHistoryComponent } from './mail-send-history.component';

describe('MailSendHistoryComponent', () => {
  let component: MailSendHistoryComponent;
  let fixture: ComponentFixture<MailSendHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailSendHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailSendHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
