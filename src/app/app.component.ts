import { Component, OnInit, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BlogService } from './components/blog/blog.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  faBars = faBars;
  public isUserAuthenticated: boolean = false;
  public isAdmin: boolean = false;
  public userEmailId: any;
  public userDetils: any;
  private userDetailsSubs: Subscription = new Subscription;
  private authListenerSubs: Subscription = new Subscription;
  public screenWidth: any
  public screenHeight: any
  showNavBar = false;

  constructor( private authService: AuthService, private breakpointObserver: BreakpointObserver, private blogService: BlogService) {
    
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;  
    this.screenHeight = window.innerHeight; 
    //this.isUserAuthenticated = this.authService.getIsAuthenticated();
    // the below subscription might take longer than expect, and we have a getter for the auth status
    this.authListenerSubs = this.authService.getAuthStatusListerner().subscribe(isAuthenticated =>{
      this.isUserAuthenticated = isAuthenticated
    });

    // this.authListenerSubs = this.authService.getIsAdminStatusListerner().subscribe(adminStatus =>{
    //   this.isAdmin = adminStatus
    // });

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
        this.isAdmin = this.userDetils.isAdmin
      }
    }    
    //this.isAdmin = this.userDetils.isAdmin
    // Move the navigator to a separate component and thus the logic
    this.authService.autoAuthUser();
    console.log(this.isAdmin, this.isUserAuthenticated, 'DATA')
  }

  logout(){
    this.authService.onLogout();
    this.blogService.readingList$.next([])
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
    if(this.screenWidth < 900) {
      this.showNavBar = !this.showNavBar
    }
  }
}
