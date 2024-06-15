import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { response } from 'express';
import { Observable, Subject } from 'rxjs';
import { AuthData } from '../pages/sign-up/auth-data.model';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: any = '';
  private authStatusListener = new Subject<boolean>();
  private isAdminStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: any;
  private userEmailId: any;
  private userDetails: any;
  public userDetailsListerner = new Subject<any>();
  private isLoading: boolean = true;
  private authResponseOnAuthentication = new Subject<{
    message: string;
    error: boolean;
    authType: string
  }>();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private socialAuthService: SocialAuthService,
  ) {}

  public getToken() {
    return this.token;
  }

  public getIsAuthenticated() {
    return this.isAuthenticated;
  }

  public getLoading() {
    return this.isLoading;
  }

  getAuthStatusListerner() {
    return this.authStatusListener.asObservable();
  }

  getIsAdminStatusListerner() {
    return this.isAdminStatusListener.asObservable();
  }

  getUserDetailsListener() {
    return this.userDetailsListerner.asObservable();
  }

  getAuthResponseOnAuthentication() {
    return this.authResponseOnAuthentication.asObservable();
  }

  public getUserEmailid() {
    // check if this is required since we are using from sessionStorage
    return this.userEmailId;
  }

  public getUserDetails() {
    return this.userDetails;
  }

  onSignUp(userData: AuthData) {
    const authData: AuthData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    };
    const observer = {
      next: (response: { message: string }) => {
        console.log(response, 'AUTH_DATA');
        this.authResponseOnAuthentication.next({
          message: response.message,
          error: false,
          authType: 'signUp'
        });
      },
      error: (error: any) => {
        console.error(error);
        this.authResponseOnAuthentication.next({
          message: error.error.message,
          error: true,
          authType: 'signUp'
        });
      },
    };

    this.httpClient
      .post<{ message: string }>(
        'http://localhost:3000/api/user/sign-up',
        authData
      )
      .subscribe(observer);
  }

  onLogin(loginData: any) {
    const userData = {
      email: loginData.email,
      password: loginData.password,
    };

    const observer = {
      next: (response: { token: string; expiresIn: number; isAdmin: boolean; email: string; firstName: string, readingList: [] }) => {
        const token = response.token;
        this.userEmailId = response.email;
        this.token = token;
        if (token) {
          this.isLoading = false;
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          // to convert sec into milliseconds
          localStorage.setItem('email', response.email);
          console.log(response, 'RES');
          this.authStatusListener.next(true);
          this.router.navigate(['/home']);

          this.isAdminStatusListener.next(response.isAdmin);
          this.userDetailsListerner.next({
            userEmailId: response.email,
            firstName: response.firstName,
            isAdmin: response.isAdmin,
            readingList: response.readingList
          });
          this.isAuthenticated = true;
          const currentTimeStamp = new Date();
          const expirationDate = new Date(currentTimeStamp.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate);
        }
      },
      error: (error: any) => {
        console.error(error, 'ERROR');
        //this.authStatusListener.next(false);
        this.authResponseOnAuthentication.next({
          message: error.error.message,
          error: true,
          authType: 'login'
        });
        // Optionally, handle the error message here and update the UI
      },
    };

    this.httpClient.post<{ token: string; expiresIn: number; isAdmin: boolean; email: string; firstName: string, readingList: [] }>(
      'http://localhost:3000/api/user/login',
      userData
    ).subscribe(observer);
  }

  onLogout() {
    this.clearAuthData();
    // Had to puss null but due to issues passing empty string, check later
    this.token = '';
    this.authStatusListener.next(false);
    this.userDetailsListerner.next({});
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.navigateToLoginPage();
    this.socialAuthService.signOut();
  }

  autoAuthUser() {
    const autoAuthInfo = this.getAuthData();
    const currentTimeStamp = new Date();
    let expiresIn: any = '';
    if (autoAuthInfo) {
      expiresIn =
        autoAuthInfo.expirationDate.getTime() - currentTimeStamp.getTime();
    }
    if (expiresIn > 0) {
      this.token = autoAuthInfo?.token;
      this.isAuthenticated = true;
      // expiresIn is coming in seconds, converting it into miliseconds
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  onSubscribe(subscriptionData: any) {
    return this.httpClient.post(
      'http://localhost:3000/api/subscribe',
      subscriptionData
    );
  }

  onLoginWithGoogle(loginData: any) {
    const userData = {
      firstName: loginData?.firstName,
      lastName: loginData?.lastName,
      email: loginData?.email,
    };
    this.httpClient
      .post<{
        token: string;
        expiresIn: number;
        isAdmin: boolean;
        email: string;
        firstName: string;
      }>('http://localhost:3000/api/user/login-with-google', userData)
      .subscribe((response) => {
        console.log(response, 'RESPONSE, LOGIN WITH GOOOGLE');
        const token = response.token;
        this.userEmailId = response.email;
        this.token = token;
        if (token) {
          this.isLoading = false;
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          // to conver sec into miliseconds
          localStorage.setItem('email', response.email);
          console.log(response, 'RES');
          //this.userDetails = response.firstName
          this.authStatusListener.next(true);
          this.userDetailsListerner.next({
            userEmailId: response.email,
            firstName: response.firstName,
            isAdmin: response.isAdmin,
          });
          this.isAuthenticated = true;
          const currentTimeStamp = new Date();
          const expirationDate = new Date(
            currentTimeStamp.getTime() + expiresInDuration * 1000
          );
          this.saveAuthData(token, expirationDate);
          this.router.navigate(['/home']);
        }
      });
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('email');
    sessionStorage.removeItem('userDetails');
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.onLogout();
    }, duration * 1000);
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
    this.router.navigate(['/login']);
  }
}
