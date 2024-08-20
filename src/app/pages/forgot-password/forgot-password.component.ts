import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: UntypedFormGroup;
  message: string = '';

  constructor(private formBuilder: UntypedFormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe(
      (response) => {
        this.message = 'Password reset link has been sent to your email.';
      },
      (error) => {
        console.log(error, 'error_forgot-pwd')
        this.message = 'Failed to send password reset link. Please try again.';
      }
    );
  }
}
