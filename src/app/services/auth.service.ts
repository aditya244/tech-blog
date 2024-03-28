import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { Observable } from 'rxjs';
import { AuthData } from '../pages/sign-up/auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private token: string = '';

  constructor(private httpClient: HttpClient) { }

  public getToken() {
    return this.token;
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
    console.log(userData, 'USER_DATA')
    this.httpClient.post<{token: string}>("http://localhost:3000/api/user/login", userData)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            console.log(response, 'LOGIN_DATA')
        });
  };
}