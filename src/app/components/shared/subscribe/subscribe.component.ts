import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from '../../blog/blog.service';
  
@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent {

    subsErrorMsg: string = '';
    subsFailed: boolean = false;
    subscriptionSuccessful: boolean = false;
    subscriptionSuccessfulRes: string = '';
  
  constructor(
    private blogService: BlogService,
    private authService: AuthService
  ) {}

  @Output() delete = new EventEmitter<boolean>();

  subscribe(email: string) {
    const subscriptionDate = new Date();
    const subscriptionData = {
      email: email,
      date: subscriptionDate,
    };
    this.authService.onSubscribe(subscriptionData).subscribe(
      (response: any) => {
        this.subscriptionSuccessful = true;
        this.subscriptionSuccessfulRes = response.message;
      },
      (error) => {
        this.subsErrorMsg = error.error.message;
        this.subsFailed = true;
      }
    );
  }
}
