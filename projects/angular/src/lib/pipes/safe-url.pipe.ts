import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {

  transform(value: string | undefined | null): string | null {
    if (!value) return null;

    let url = value.trim();
    const urlPattern = /^(http|https):\/\/[^ "]+$|^(www\.)?[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(\/\S*)?$/;
    
    if (!urlPattern.test(url)) {
      return null;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    return url;
  }

}
