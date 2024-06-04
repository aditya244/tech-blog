import { Component, OnInit } from '@angular/core';
import { Form, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor( private formBuilder: UntypedFormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
      //verifyPassword: ['', Validators.required]
    })
    this.authService.getAuthResponseOnAuthentication().subscribe(
      (authStatus) => {
        if ( authStatus.authType === 'signUp') {
          if (authStatus.error) {
            this.errorMessage = authStatus.message;
          } 
          else {
            this.successMessage = authStatus.message;
          }
        }
      }
    );
  }

  async onSignUp() {
    //console.log(form);
    // should get form data
    this.authService.onSignUp(this.registerForm.value)
    

  }

  // move this method to a service
  // createUser() {
  //   this.http.post
  // }
}
