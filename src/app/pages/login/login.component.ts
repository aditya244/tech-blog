import { Component, OnInit } from '@angular/core';
import { Form, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor( private formBuilder: UntypedFormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required]
    })
  }

  onLogin(){
    if(!this.loginForm) {
      return;
    }
    const userEmailId = this.loginForm.value.email
    this.authService.onLogin(this.loginForm.value);
    this.checkSubscriptionStatus(userEmailId);
    this.authService.getAuthResponseOnAuthentication().subscribe(
      (authStatus) => {
        if ( authStatus.authType === 'login') {
          if (authStatus.error) {
            this.errorMessage = authStatus.message;
          } 
          else {
            this.successMessage = authStatus.message;
            console.log(authStatus.message)
          }
        }
      }
    );
    //console.log(this.loginForm.value, 'LOGIN_LOG')
  }

  // Add getter for easy access to form controls
  get login() {
    return this.loginForm.controls;
  }

  checkSubscriptionStatus(email: string) {
    this.authService.getSubscriptionStatus(email)
      .subscribe(
        (response) => {
          if(response.subscriptionStatus) {
            this.authService.isSubscriber.next(true)
          }
          console.log('Subscription Status:', response);
          // Handle response as needed
        },
        (error) => {
          console.error('Error:', error);
          // Handle error appropriately
        }
      );
  }
}
  
