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

  constructor( private formBuilder: UntypedFormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
      //verifyPassword: ['', Validators.required]
    })
  }

  onSignUp() {
    //console.log(form);
    // should get form data
    this.authService.onSignUp(this.registerForm.value)
    //console.log(this.registerForm.value, 'REGISTER_FORM')
    

  }

  // move this method to a service
  // createUser() {
  //   this.http.post
  // }
}
