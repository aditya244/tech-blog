import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { EMPTY, filter, forkJoin, map, pipe, switchMap, take, tap } from 'rxjs';
import { BlogService } from 'src/app/components/blog/blog.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { DialogComponent } from 'src/app/components/shared/dialog/dialog.component';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
//import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss'],
})
export class BlogDetailsComponent implements OnInit {
  selectedBlog: any = {};
  comments: any[] = [];
  allComments: any[] = [];
  allCommentThreads: any[] = [];
  visibleCommentThreads: any[] = [];
  comment: string = '';
  id: any;
  enableRemoveReadingListBtn: boolean = false;
  isLoading: boolean = true;
  suggestedBlogs: any;
  public isAdmin: boolean = false;
  public isAuthenticated: boolean = false;
  public showAddToReadingList: boolean = false;
  public commentsLimit: number = 10;
  public totalCommentsCount: number = 0;
  replyDrafts: { [key: string]: string } = {};
  public currentUserName: string = '';
  public currentUserEmail: string = '';
  public loadMoreEnabled: boolean = false;
  public blogLikes: number = 0;
  public userHasLiked: boolean = false;
  faThumbsUp = faThumbsUp;
  //private apiUrl = environment.apiUrl;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
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
      this.isLoading = true;

      this.blogService.getBlogDetails(id).subscribe({
        next: (res) => {
          this.selectedBlog = res.blog;

          // Hide immediately
          this.isLoading = false;

          this.toggleReadingListBtn(this.selectedBlog);

          // Load secondary content later
          this.blogService
            .getSuggestedBlogs(this.selectedBlog.suggestedBlogIds)
            .subscribe((r) => {
              this.suggestedBlogs = r;
            });

          this.fetchComments();
          this.fetchBlogLikes();
        },
      });

      // this.blogService.getBlogDetails(id).pipe(
      //   tap((res) => {
      //     this.selectedBlog = res.blog;
      //     this.toggleReadingListBtn(this.selectedBlog);
      //   }),
      //   // Chain the second API call after the first one completes
      //   switchMap(() => this.blogService.getSuggestedBlogs(this.selectedBlog.suggestedBlogIds)) // Replace with your second API method
      // ).subscribe({
      //   next: (response) => {
      //     this.isLoading = false;
      //     this.suggestedBlogs = response;
      //     this.fetchComments();
      //     this.fetchBlogLikes();
      //   },
      //   error: (error) => {
      //     this.isLoading = false;
      //     console.error(error);
      //   }
      // });
    });

    this.authService.getAuthStatusListerner().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
    // The below code is to handle scrollToTop after click on Homepage to Blog Details
    const userDetailsStr: any = sessionStorage.getItem('userDetails');
    if (userDetailsStr) {
      const jsonUserDetails = JSON.parse(userDetailsStr);
      this.isAdmin = jsonUserDetails?.isAdmin;
      this.currentUserName =
        `${jsonUserDetails?.firstName ?? ''} ${jsonUserDetails?.lastName ?? ''}`.trim();
      this.currentUserEmail = jsonUserDetails?.userEmailId || '';
    }

    // this.authService.getUserDetailsListener().subscribe((userDetails) => {
    //   if (userDetails) {
    //         console.log(userDetails, 'userDetails')
    //     this.currentUserName = `${userDetails.firstName ?? ''} ${userDetails.lastName ?? ''}`.trim();
    //     this.currentUserEmail = userDetails.userEmailId || userDetails.email || this.currentUserEmail;
    //     this.isAdmin = userDetails.isAdmin ?? this.isAdmin;
    //   }
    // });
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

  fetchComments(): void {
    if (!this.id) {
      return;
    }
    this.blogService.getCommentsForBlog(this.id).subscribe({
      next: (res) => {
        this.allComments = res.comments || [];
        this.totalCommentsCount = this.allComments.length;
        this.prepareCommentThreads();
        this.updateVisibleThreads();
      },
      error: (error) => {
        console.error('Failed to fetch comments', error);
        this.openSnackBar('Could not load comments', 'error');
      },
    });
  }

  prepareCommentThreads() {
    const rootComments = this.allComments
      .filter((c) => !c.parentCommentId)
      .sort(
        (a, b) =>
          new Date(a.dateOfPublish).valueOf() -
          new Date(b.dateOfPublish).valueOf(),
      );

    const repliesByParent: { [key: string]: any[] } = {};
    this.allComments
      .filter((c) => c.parentCommentId)
      .sort(
        (a, b) =>
          new Date(a.dateOfPublish).valueOf() -
          new Date(b.dateOfPublish).valueOf(),
      )
      .forEach((reply) => {
        repliesByParent[reply.parentCommentId] =
          repliesByParent[reply.parentCommentId] || [];
        repliesByParent[reply.parentCommentId].push(reply);
      });

    this.allCommentThreads = rootComments.map((root) => ({
      root,
      replies: repliesByParent[root._id] || [],
    }));
  }

  updateVisibleThreads() {
    const threads: any[] = this.allCommentThreads;
    const visible: any[] = [];
    let count = 0;

    for (const thread of threads) {
      const replies = thread.replies || [];
      const threadCount = 1 + replies.length;

      if (count + threadCount <= this.commentsLimit) {
        visible.push(thread);
        count += threadCount;
      } else {
        const remaining = this.commentsLimit - count;
        if (remaining <= 0) {
          break;
        }

        // If we can include root comment and some replies
        if (remaining >= 1) {
          const trimmedReplies = replies.slice(0, Math.max(0, remaining - 1));
          visible.push({ root: thread.root, replies: trimmedReplies });
        }
        count = this.commentsLimit;
        break;
      }
    }

    this.visibleCommentThreads = visible;
    this.loadMoreEnabled = this.totalCommentsCount > this.commentsLimit;
  }

  onCommentSubmit(currentCommentValue: string) {
    if (!currentCommentValue || !currentCommentValue.trim()) {
      this.openSnackBar('Comment cannot be empty', 'error');
      return;
    }

    const trimmedComment = currentCommentValue.trim();

    if (trimmedComment.length > 500) {
      this.openSnackBar('Comment cannot exceed 500 characters', 'error');
      return;
    }

    if (!this.isAuthenticated) {
      this.openSnackBar('Please login before posting a comment', 'info');
      return;
    }

    const payload = {
      comment: trimmedComment,
      blogId: this.id,
      authorName: this.currentUserName || 'Anonymous',
      authorEmail: this.currentUserEmail || 'unknown@domain.com',
    };

    this.blogService.addComment(payload).subscribe({
      next: () => {
        this.comment = '';
        this.fetchComments();
        this.openSnackBar('Comment added successfully', 'success');
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.openSnackBar('Could not add comment', 'error');
      },
    });
  }

  onReplySubmit(parentCommentId: string) {
    const reply = (this.replyDrafts[parentCommentId] || '').trim();
    if (!reply) {
      this.openSnackBar('Reply cannot be empty', 'error');
      return;
    }

    if (reply.length > 500) {
      this.openSnackBar('Reply cannot exceed 500 characters', 'error');
      return;
    }

    if (!this.isAuthenticated || !this.isAdmin) {
      this.openSnackBar('Only admins can post replies', 'error');
      return;
    }

    const payload = {
      comment: reply,
      blogId: this.id,
      parentCommentId: parentCommentId,
      authorName: this.currentUserName || 'Admin',
      authorEmail: this.currentUserEmail || 'admin@domain.com',
    };

    this.blogService.addComment(payload).subscribe({
      next: () => {
        this.replyDrafts[parentCommentId] = '';
        this.fetchComments();
        this.openSnackBar('Reply posted', 'success');
      },
      error: (error) => {
        console.error('Error posting reply', error);
        this.openSnackBar('Could not post reply', 'error');
      },
    });
  }

  onDeleteComment(commentId: string) {
    if (!this.isAdmin) {
      this.openSnackBar('Only admins can delete comments', 'error');
      return;
    }

    this.blogService.deleteComment(commentId).subscribe({
      next: () => {
        this.fetchComments();
        this.openSnackBar('Comment deleted', 'success');
      },
      error: (error) => {
        console.error('Error deleting comment', error);
        this.openSnackBar('Comment delete failed', 'error');
      },
    });
  }

  loadMoreComments() {
    this.commentsLimit += 10;
    this.updateVisibleThreads();
  }

  fetchBlogLikes(): void {
    if (!this.id) {
      return;
    }
    this.blogService.getBlogLikes(this.id).subscribe({
      next: (res) => {
        this.blogLikes = res.likeCount || 0;
        if (this.isAuthenticated && this.currentUserEmail) {
          this.userHasLiked =
            res.likedBy?.includes(this.currentUserEmail) || false;
        }
      },
      error: (error) => {
        console.error('Failed to fetch likes', error);
        this.blogLikes = 0;
      },
    });
  }

  onThumbsUp(): void {
    if (!this.isAuthenticated) {
      this.openSnackBar('Please login to like this blog', 'info');
      return;
    }

    if (this.userHasLiked) {
      this.removeLike();
    } else {
      this.addLike();
    }
  }

  private addLike(): void {
    if (!this.id || !this.currentUserEmail) {
      this.openSnackBar('Error: Cannot add like', 'error');
      return;
    }

    this.blogService.addBlogLike(this.id, this.currentUserEmail).subscribe({
      next: () => {
        this.userHasLiked = true;
        this.blogLikes += 1;
        this.openSnackBar('Liked!', 'success');
      },
      error: (error) => {
        console.error('Error adding like', error);
        this.openSnackBar('Could not add like', 'error');
      },
    });
  }

  private removeLike(): void {
    if (!this.id || !this.currentUserEmail) {
      this.openSnackBar('Error: Cannot remove like', 'error');
      return;
    }

    this.blogService.removeBlogLike(this.id, this.currentUserEmail).subscribe({
      next: () => {
        this.userHasLiked = false;
        this.blogLikes = Math.max(0, this.blogLikes - 1);
        this.openSnackBar('Like removed', 'success');
      },
      error: (error) => {
        console.error('Error removing like', error);
        this.openSnackBar('Could not remove like', 'error');
      },
    });
  }

  openSnackBar(message: string, type: 'success' | 'error' | 'info') {
    const setClass =
      type === 'success'
        ? 'snack-success'
        : type === 'error'
          ? 'snack-error'
          : 'snack-info';
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: [setClass],
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
  //   this.http.post<{message: string}>(`${this.apiUrl}/comments`, requestBody).subscribe((response) => {
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

  private toggleReadingListBtn(selectedBlog: { _id: string }) {
    this.blogService.readingList$
      .pipe(take(1)) // Unsubscribe after the first emission to prevent memory leaks
      .subscribe((currentReadingList) => {
        this.showAddToReadingList =
          currentReadingList.indexOf(selectedBlog._id) === -1;
      });
  }
}

