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
    //console.log(this.loginForm.value, 'LOGIN_LOG')
  }

  // Add getter for easy access to form controls
  get login() {
    return this.loginForm.controls;
  }
  

}
