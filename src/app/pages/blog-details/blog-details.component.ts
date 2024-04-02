import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, pipe } from 'rxjs';
import { BlogService } from 'src/app/components/blog/blog.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/components/shared/dialog/dialog.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {

  selectedBlog: any = {};
  comments:any[] = [];
  comment: string = '';
  id: any;
  public isAdmin: boolean = false;
  public isAuthenticated: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.blogService.getBlogDetails(this.id).subscribe(res => {
      console.log(res, 'response_blogDetails')
      this.selectedBlog = res.blog;
    });
    this.authService.getIsAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.fetchComments();
  }

  commentForm: FormGroup = this.fb.group({
    blogComments: this.fb.array([new FormControl('')]),
  })

  fetchComments() {
    this.blogService.getCommentsForBlog(this.id).subscribe(res => {
      this.comments = res.comments;
      // was having intermittent issues with comment rendering on submit, thus added this.
      // check for this later as well
      this.cdr.detectChanges();
    })
  }

  onDeleteBlog(id:any) {
    this.blogService.deleteBlogPost(id)
    .subscribe(res => {
      this.router.navigate(['home']);
      this.dialog.closeAll();
    })
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
    });
    dialogRef.componentInstance.delete.subscribe(res => {
      if(res) {
        this.onDeleteBlog(this.selectedBlog._id);
      }
    })
  }

  private convertDateFormat() {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(currentDate);
    return formattedDate
  }

  onCommentSubmit(comment: string){
    const formattedDate = this.convertDateFormat();
    const requestBody = {
      comment: comment,
      blogId: this.id,
      dateOfPublish: formattedDate
    }
    this.http.post<{message: string}>("http://localhost:3000/api/comments", requestBody).subscribe((response) => {
      console.log(response, 'COMMENTS');
      if (response && response.message === 'Comment added successfully') {
        console.log('inside the response')
        this.fetchComments();
      }
    },
    (error) => {
      console.error('Error adding comment:', error);
    })
    this.comment = '';
  }

  onDeleteComment(commentId: string) {
    this.blogService.deleteComment(commentId).subscribe(res => {
      this.fetchComments();
    })
  }
}

