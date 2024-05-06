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
  public userDetils: any;
  private userDetailsSubs: Subscription = new Subscription;
  private authListenerSubs: Subscription = new Subscription;

  constructor( private authService: AuthService) {}

  ngOnInit(): void {
    this.isUserAuthenticated = this.authService.getIsAuthenticated();
    // the below subscription might take longer than expect, and we have a getter for the auth status
    this.authListenerSubs = this.authService.getAuthStatusListerner().subscribe(isAuthenticated =>{
      this.isUserAuthenticated = isAuthenticated
    });

    this.userDetailsSubs = this.authService.getUserDetailsListener().subscribe(userDetails => {
      console.log(userDetails, 'USER_DET')
      this.userDetils = userDetails;
      this.isAdmin = userDetails.isAdmin;
      sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
    })
    //this.isAdmin = this.userDetils.isAdmin;
    this.userEmailId = sessionStorage.getItem('email')
    if(!this.userDetils) {
      const userDetailsStr = sessionStorage.getItem('userDetails')
      if(userDetailsStr) {
        this.userDetils = JSON.parse(userDetailsStr)
      }
    }    
    // Move the navigator to a separate component and thus the logic
    this.authService.autoAuthUser();
    console.log(this.isAdmin, this.isUserAuthenticated, 'DATA')
  }

  logout(){
    this.authService.onLogout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.userDetailsSubs.unsubscribe();
  }
}
