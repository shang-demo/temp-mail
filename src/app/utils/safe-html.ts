import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'mySafeHtml', pure: false })
export class MySafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  public transform(content) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
