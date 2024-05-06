import { Component, OnInit } from '@angular/core';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { Router } from '@angular/router';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  blogForFeed: Blog[] = [];
  isLoading: boolean = true;
  isErrorFromServer:boolean = false;
  subsErrorMsg: string = '';
  subsFailed: boolean = false;
  user: any;
  isUserAuthenticated: boolean = false;
  
  constructor(private blogService: BlogService, 
      private authService: AuthService, 
      private socialAuthService: SocialAuthService,
      private route: Router 
    ) { }

  ngOnInit(): void {
    this.authService.getAuthStatusListerner().subscribe(isAuthenticated =>{
      this.isUserAuthenticated = isAuthenticated
    });
    console.log(this.user, 'init')
    this.blogService
      .getBlogsForHomeFeed()
      .pipe(
        map((data) => {
          // added this pipe and map to convert each data _id to id to map with frontends
          console.log(data, 'FETCHED_BLOGS');
          return data.blogs.map((blogData: any) => {
            return {
              title: blogData.title,
              id: blogData._id,
              content: blogData.content,
            };
          });
        }),
        catchError((error) => {
          console.error('Error fetching blogs:', error);
          this.isErrorFromServer = true;
          this.isLoading = false; 
          return error; 
        })
      )
      .subscribe((data) => {
        if (data) {
          this.isLoading = false;
        }
        this.blogForFeed = data;
      });

        this.socialAuthService.authState.subscribe((user) => {
          this.user = user;
          console.log(this.user, 'USER_GOOGLE')
          this.authService.onLoginWithGoogle(user)
        });
  }

  onAddToReadingList(blogId: string) {
    this.blogService.addToReadingList(blogId)
  }

  subscribe(email: string) {
    const subscriptionDate = new Date();
    const subscriptionData = {
      email: email,
      date: subscriptionDate
    }
    this.authService.onSubscribe(subscriptionData).subscribe(response => {
    },
    error => {
      this.subsErrorMsg = error.error.message;
      this.subsFailed = true;
    }
    )
  }

  navigateTo(path: string) {
    if(path === 'login') {
      this.route.navigateByUrl("/login")
    } else {
      this.route.navigateByUrl("/sign-up")
    }
  }

}
