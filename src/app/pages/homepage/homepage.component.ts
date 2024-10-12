import { Component, OnInit } from '@angular/core';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { Router } from '@angular/router';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import { DialogComponent } from 'src/app/components/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SubscribeDialogComponent } from 'src/app/components/shared/subscribe-dialog/subscribe-dialog.component';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  blogForFeed: Blog[] = [];
  isLoading: boolean = true;
  isErrorFromServer: boolean = false;
  user: any;
  isUserAuthenticated: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedBlogTitle: any;
  isASubscriber: boolean = false;
  screenWidth: number = 0;
  screenHeight: number = 0;

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private screenSizeService: ScreenSizeService,
    private route: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // can combine both the below behaviorSubject to send data together and will require only one subscription.
    this.authService.getAuthStatusListerner().subscribe((isAuthenticated) => {
      this.isUserAuthenticated = isAuthenticated;
      console.log(isAuthenticated, 'isAuthenticated');
    });
    this.screenSizeService.screenSize$.subscribe(size => {
      this.screenWidth = size.width;
      this.screenHeight = size.height;
    });
    this.authService.isSubscriber.subscribe((susbcriptionStatus) => {
      this.isASubscriber = susbcriptionStatus;
      if (!this.isASubscriber) {
        const subsStatus = sessionStorage.getItem('subscriptionStatus');
        this.isASubscriber = JSON.parse(subsStatus as string);
      }
    });
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
          console.log(this.screenWidth, 'screenWidth')
            setTimeout(() => {
              if(this.screenWidth < 600) {
              this.openSubscribeDialog();
              }
            }, 5000)
        }
        this.blogForFeed = data;
      });

    this.socialAuthService.authState.subscribe((user) => {
      this.user = user;
      console.log(this.user, 'USER_GOOGLE');
      this.authService.onLoginWithGoogle(user);
    });
    console.log(this.screenHeight, this.screenWidth, 'screenSize')
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

  onAddToReadingList(blogId: string | undefined, title: string) {
    // undefined is added with blogId as in interface we have made it as optional param.
    if (!blogId) {
      console.error('Blog ID is missing!');
      return;
    }
    console.log(this.isUserAuthenticated, 'isAuth');
    this.selectedBlogTitle = title;
    if (!this.isUserAuthenticated) {
      this.clearMessage('errorMessage');
      this.errorMessage = 'Please login to add it to the reading list!';
      return;
    }
    this.blogService.addToReadingList(blogId);
  }

  openSubscribeDialog(): void {
    this.dialog.open(SubscribeDialogComponent, {
      width: '500px',
      height: 'auto'
    });
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
}
