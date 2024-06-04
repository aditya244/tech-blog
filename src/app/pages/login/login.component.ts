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
    this.authService.onLogin(this.loginForm.value);
    this.authService.getAuthResponseOnAuthentication().subscribe(
      (authStatus) => {
        if ( authStatus.authType === 'login') {
          if (authStatus.error) {
            this.errorMessage = authStatus.message;
          } 
          // else {
          //   this.successMessage = authStatus.message;
          // }
        }
      }
    );
    //console.log(this.loginForm.value, 'LOGIN_LOG')
  }

  // Add getter for easy access to form controls
  get login() {
    return this.loginForm.controls;
  }
  

}
