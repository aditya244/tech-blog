import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../environments/environment';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  constructor(private router: Router) {
    if (environment.production) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.setPageView(event.urlAfterRedirects);
        }
      });
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.setPageView(event.urlAfterRedirects);
        }
      });
    }
  }

  setPageView(url: string) {
    if (environment.production) {
        gtag('config', environment.googleAnalyticsId, { page_path: url });
    }
  }

  event(category: string, action: string, label: string, value: number) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  
}

