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
   private userEmailId: any

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

  public getUserEmailid() {
    return this.userEmailId;
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
    this.httpClient.post<{token: string, expiresIn: number, isAdmin: boolean}>("http://localhost:3000/api/user/login", userData)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            if (token) {
                this.userEmailId = loginData.email;
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                // to conver sec into miliseconds
                this.isAdminUser = response.isAdmin;
                this.authStatusListener.next(true);
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
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
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
}