import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setPageView(event.urlAfterRedirects);
      }
    });
  }

  setPageView(url: string) {
    gtag('config', 'G-TWGGJN2TD5', { page_path: url });
  }

  event(category: string, action: string, label: string, value: number) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

