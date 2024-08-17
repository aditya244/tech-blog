import { Component, OnInit } from '@angular/core';
import { Form, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: [''],
        email: ['', Validators.required, Validators.email],
        password: ['', Validators.required],
        verifyPassword: ['', Validators.required],
      },
      {
        validator: this.passwordMatchValidator('password', 'verifyPassword'),
      }
    );
    this.authService
      .getAuthResponseOnAuthentication()
      .subscribe((authStatus) => {
        if (authStatus.authType === 'signUp') {
          if (authStatus.error) {
            this.errorMessage = authStatus.message;
          } else {
            this.successMessage = authStatus.message;
          }
        }
      });
  }

  async onSignUp() {
    if (this.registerForm.invalid) {
      return;
    }
    this.authService.onSignUp(this.registerForm.value);
  }
  

  passwordMatchValidator(password: string, verifyPassword: string) {
    return (formGroup: UntypedFormGroup): { [key: string]: boolean } | null => {
      const passwordControl = formGroup.controls[password];
      const verifyPasswordControl = formGroup.controls[verifyPassword];
  
      if (!passwordControl || !verifyPasswordControl) {
        return null;
      }
  
      if (verifyPasswordControl.errors && !verifyPasswordControl.errors['passwordMismatch']) {
        return null;
      }
  
      if (passwordControl.value !== verifyPasswordControl.value) {
        verifyPasswordControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        verifyPasswordControl.setErrors(null);
        return null;
      }
    };
  }
  

  // move this method to a service
  // createUser() {
  //   this.http.post
  // }
}
