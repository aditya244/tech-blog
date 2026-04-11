import { Component, OnInit, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BlogService } from './components/blog/blog.service';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './services/google-analytics-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  faBars = faBars;
  public isUserAuthenticated: boolean = false;
  public isAdmin: boolean = false;
  public userEmailId: any;
  public userDetils: any;
  private userDetailsSubs: Subscription = new Subscription();
  private authListenerSubs: Subscription = new Subscription();
  public screenWidth: any;
  public screenHeight: any;
  showNavBar = false;

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private blogService: BlogService,
    private googleAnalyticsService: GoogleAnalyticsService
    // This unused import is added here since the service was not being initialised.
  ) {}

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.authListenerSubs = this.authService
      .getAuthStatusListerner()
      .subscribe((isAuthenticated) => {
        this.isUserAuthenticated = isAuthenticated;
      });
    this.userDetailsSubs = this.authService
      .getUserDetailsListener()
      .subscribe((userDetails) => {
        this.userDetils = userDetails;
        this.isAdmin = userDetails.isAdmin;
        // Store user details in sessionStorage for session convenience only
        // NOTE: This is not a security measure - the actual authorization must be validated server-side
        sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
      });
    this.userEmailId = sessionStorage.getItem('email');
    if (!this.userDetils) {
      const userDetailsStr = sessionStorage.getItem('userDetails');
      if (userDetailsStr) {
        this.userDetils = JSON.parse(userDetailsStr);
        this.isAdmin = this.userDetils.isAdmin;
      }
    }
    // Validate session on app init - ensures server agrees with stored user details
    this.authService.autoAuthUser();
  }

  logout() {
    this.authService.onLogout();
    this.blogService.readingList$.next([]);
    this.showNavBar = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.userDetailsSubs.unsubscribe();
  }

  toggleNavbarResponsive() {
    if (this.screenWidth < 900) {
      this.showNavBar = !this.showNavBar;
    }
  }

  closeNavbar() {
    this.showNavBar = false;
  }
}
