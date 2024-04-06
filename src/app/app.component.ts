import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public isUserAuthenticated: boolean = false;
  public isAdmin: boolean = false;
  public userEmailId: any;
  private authListenerSubs: Subscription = new Subscription;

  constructor( private authService: AuthService) {}

  ngOnInit(): void {
    this.isUserAuthenticated = this.authService.getIsAuthenticated();
    // the below subscription might take longer than expect, and we have a getter for the auth status
    this.authListenerSubs = this.authService.getAuthStatusListerner().subscribe(isAuthenticated =>{
      this.isUserAuthenticated = isAuthenticated
    });
    this.userEmailId = sessionStorage.getItem('email')
    this.isAdmin = this.authService.isAdmin();
    // Move the navigator to a separate component and thus the logic
    this.authService.autoAuthUser();
  }

  logout(){
    this.authService.onLogout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
