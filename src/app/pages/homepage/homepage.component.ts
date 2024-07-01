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
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  blogForFeed: Blog[] = [];
  isLoading: boolean = true;
  isErrorFromServer: boolean = false;
  subsErrorMsg: string = '';
  subsFailed: boolean = false;
  user: any;
  isUserAuthenticated: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedBlogTitle: any;
  isASubscriber: boolean = false;
  subscriptionSuccessful: boolean = false;
  subscriptionSuccessfulRes: string = '';

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private route: Router
  ) {}

  ngOnInit(): void {
    // can combine both the below behaviorSubject to send data together and will require only one subscription.
    this.authService.getAuthStatusListerner().subscribe((isAuthenticated) => {
      this.isUserAuthenticated = isAuthenticated;
      console.log(isAuthenticated, 'isAuthenticated');
    });
    this.authService.isSubscriber.subscribe((susbcriptionStatus) => {
      this.isASubscriber = susbcriptionStatus;
    });
    console.log(this.user, 'init');
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
              imagePath: blogData.imagePath,
              datePublished: blogData.datePublished,
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
        this.blogForFeed = this.sortBlogsByPublishedDate(data);
        //this.blogForFeed = data;
      });

    this.socialAuthService.authState.subscribe((user) => {
      this.user = user;
      console.log(this.user, 'USER_GOOGLE');
      this.authService.onLoginWithGoogle(user);
    });

    this.authService.userDetailsListerner.subscribe((userDetails) => {
      this.blogService.readingList$.next(userDetails.readingList);
      console.log(userDetails.readingList, 'readingList_Homepage');
    });

    this.blogService.getReadingListResSubscription().subscribe((resStatus) => {
      if (resStatus.error) {
        this.clearMessage('errorMessage');
        this.errorMessage = resStatus.message;
      } else {
        this.clearMessage('successMessage');
        this.successMessage = resStatus.message;
      }
    });
  }

  onAddToReadingList(blogId: string, title: string) {
    this.selectedBlogTitle = title;
    this.blogService.addToReadingList(blogId);
  }

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

  navigateTo(path: string) {
    if (path === 'login') {
      this.route.navigateByUrl('/login');
    } else {
      this.route.navigateByUrl('/sign-up');
    }
  }

  clearMessage(messageType: 'errorMessage' | 'successMessage') {
    setTimeout(() => {
      this[messageType] = '';
    }, 3000); // Clear the message after 3 seconds
  }

  sortBlogsByPublishedDate(blogsArray: any) {
    let sortedBlogData: Blog[] = []
    sortedBlogData = blogsArray.sort((a: any, b: any) => {
      const dateA: any = this.convertToDateObject(a.datePublished);
      const dateB: any = this.convertToDateObject(b.datePublished);
      return dateB - dateA;
    });
    console.log(sortedBlogData, 'sortedBlogData')
    return sortedBlogData
  }

  convertToDateObject(dateString: any) {
    const parts = dateString.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return new Date(formattedDate);
  }
}
