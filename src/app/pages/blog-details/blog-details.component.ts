import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, map, pipe } from 'rxjs';
import { BlogService } from 'src/app/components/blog/blog.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/components/shared/dialog/dialog.component';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss'],
})
export class BlogDetailsComponent implements OnInit {
  selectedBlog: any = {};
  comments: any[] = [];
  comment: string = '';
  id: any;
  enableRemoveReadingListBtn: boolean = false;
  isLoading: boolean = true;
  public isAdmin: boolean = false;
  public isAuthenticated: boolean = false;
  public showAddToReadingList: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.id = id;
      this.blogService.getBlogDetails(id).subscribe((res) => {
        this.isLoading = false;
        this.selectedBlog = res.blog;
        this.toggleReadingListBtn(res.blog);
      });
    });
    this.authService.getAuthStatusListerner().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      console.log(isAuthenticated, 'isAuthenticated');
    });
    // The below code is to handle scrollToTop after click on Homepage to Blog Details
    const userDetailsStr: any = sessionStorage.getItem('userDetails');
    const jsonUserDetails = JSON.parse(userDetailsStr);
    this.isAdmin = jsonUserDetails?.isAdmin;
    //this.fetchComments();
    console.log(this.isAdmin, this.isAuthenticated, 'DETAILS');
  }

  commentForm: UntypedFormGroup = this.fb.group({
    blogComments: this.fb.array([new UntypedFormControl('')]),
  });

  // fetchComments() {
  //   this.blogService.getCommentsForBlog(this.id).subscribe(res => {
  //     this.comments = res.comments;
  //     // was having intermittent issues with comment rendering on submit, thus added this.
  //     // check for this later as well
  //     this.cdr.detectChanges();
  //   })
  // }

  onDeleteBlog(id: any) {
    this.blogService.deleteBlogPost(id).subscribe((res) => {
      this.router.navigate(['home']);
      this.dialog.closeAll();
    });
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
    });
    dialogRef.componentInstance.delete.subscribe((res) => {
      if (res) {
        this.onDeleteBlog(this.selectedBlog._id);
      }
    });
  }

  editBlog(blogId: string): void {
    this.router.navigate(['/edit-blog', blogId]);
  }

  private convertDateFormat() {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(currentDate);
    return formattedDate;
  }

  addToReadingList(blogId: string) {
    this.blogService.addToReadingList(blogId);
  }

  removeFromReadingList(blogId: string) {
    const userEmailid: any = localStorage.getItem('email');
    this.blogService.removeFromReadingList(userEmailid, blogId);
  }

  // onCommentSubmit(comment: string){
  //   const formattedDate = this.convertDateFormat();
  //   const requestBody = {
  //     comment: comment,
  //     blogId: this.id,
  //     dateOfPublish: formattedDate
  //   }
  //   this.http.post<{message: string}>("http://localhost:3000/api/comments", requestBody).subscribe((response) => {
  //     console.log(response, 'COMMENTS');
  //     if (response && response.message === 'Comment added successfully') {
  //       console.log('inside the response')
  //       this.fetchComments();
  //     }
  //   },
  //   (error) => {
  //     console.error('Error adding comment:', error);
  //   })
  //   this.comment = '';
  // }

  // onDeleteComment(commentId: string) {
  //   this.blogService.deleteComment(commentId).subscribe(res => {
  //     this.fetchComments();
  //   })
  // }

  private toggleReadingListBtn(selectedBlog: { _id: String }) {
    this.blogService.readingList$.subscribe((currentReadingList) => {
      if (currentReadingList.indexOf(selectedBlog._id) === -1) {
        this.showAddToReadingList = true;
      } else {
        this.showAddToReadingList = false;
      }
    });
  }
}

