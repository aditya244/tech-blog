import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthData } from '../pages/sign-up/auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private token: any = '';
   private authStatusListener = new Subject<boolean>();
   private isAuthenticated = false;
   private tokenTimer: any;
   private isAdminUser: boolean = false;
   private userEmailId: any;
   private userDetails: any;
   private userDetailsListerner = new Subject<any>();

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  public getToken() {
    return this.token;
  }

  public getIsAuthenticated() {
    return this.isAuthenticated;
  }

  public isAdmin() {
    return this.isAdminUser;
  }

  getAuthStatusListerner() {
    return this.authStatusListener.asObservable();
  }

  getUserDetailsListener() {
    return this.userDetailsListerner.asObservable();
  }

  public getUserEmailid() {
    // check if this is required since we are using from sessionStorage
    return this.userEmailId;
  }

  public getUserDetails() {
    return this.userDetails
  }

  onSignUp(userData: AuthData){
    const authData: AuthData = {
        firstName: userData.firstName, lastName: userData.lastName, email: userData.email, password: userData.password
    }
    this.httpClient.post("http://localhost:3000/api/user/sign-up", authData)
        .subscribe(response => {
            console.log(response, 'AUTH_DATA')
        });
  };

  onLogin(loginData: any) {
    const userData: any = {
        email: loginData.email,
        password: loginData.password
    }
    this.httpClient.post<{token: string, expiresIn: number, isAdmin: boolean, email: string, firstName: string}>("http://localhost:3000/api/user/login", userData)
        .subscribe(response => {
            const token = response.token;
            this.userEmailId = response.email;
            this.token = token;
            if (token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                // to conver sec into miliseconds
                localStorage.setItem('email', response.email)
                console.log(response, 'RES')
                //this.userDetails = response.firstName
                this.isAdminUser = response.isAdmin;
                this.authStatusListener.next(true);
                this.userDetailsListerner.next({
                  userEmailId: response.email,
                  firstName: response.firstName
                })
                this.isAuthenticated = true;
                const currentTimeStamp = new Date();
                const expirationDate = new Date(currentTimeStamp.getTime() + expiresInDuration * 1000)
                this.saveAuthData(token, expirationDate);
                this.router.navigate(['/home'])
            }
        });
  };

  onLogout(){
    this.clearAuthData();
    // Had to puss null but due to issues passing empty string, check later
    this.token = '';
    this.authStatusListener.next(false);
    this.userDetailsListerner.next({})
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.navigateToLoginPage();
  }

  autoAuthUser() {
    const autoAuthInfo = this.getAuthData();
    const currentTimeStamp = new Date();
    let expiresIn: any = '';
    if (autoAuthInfo) {
        expiresIn = autoAuthInfo.expirationDate.getTime() - currentTimeStamp.getTime();
    }
    if (expiresIn > 0) {
        this.token = autoAuthInfo?.token;
        this.isAuthenticated = true;
        // expiresIn is coming in seconds, converting it into miliseconds
        this.setAuthTimer(expiresIn / 1000)
        this.authStatusListener.next(true);
    }
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('email')
    sessionStorage.removeItem('userDetails')
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
        this.onLogout();
    }, duration * 1000)
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
    };
  }

  private navigateToLoginPage() {
    this.router.navigate(['/login'])
  }
}