import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  contactForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting = false;
  private apiUrl = environment.apiUrl;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      name: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
  }

  submitContactForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { ...this.contactForm.value };

    this.http.post<{ message: string }>(`${this.apiUrl}/contact`, payload)
      .subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Your message was sent successfully.';
          this.errorMessage = '';
          this.contactForm.reset();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Unable to send your message. Please try again later.';
          this.successMessage = '';
          this.isSubmitting = false;
        }
      });
  }

  get title() {
    return this.contactForm.get('title');
  }

  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get message() {
    return this.contactForm.get('message');
  }
}
