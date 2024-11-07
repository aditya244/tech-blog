import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  constructor(private router: Router) {
    console.log('GoogleAnalyticsService initialized');
    console.log(environment.production, 'env')
    if (environment.production) {
        console.log('analytics calls being made from prod')
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.setPageView(event.urlAfterRedirects);
        }
      });
    }
  }

  setPageView(url: string) {
    console.log(environment.production, 'env');
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

