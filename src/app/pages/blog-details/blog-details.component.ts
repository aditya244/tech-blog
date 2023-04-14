import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, pipe } from 'rxjs';
import { BlogService } from 'src/app/components/blog/blog.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/components/shared/dialog/dialog.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {

  selectedBlog: any = {};
  comments:string[] = [];
  comment: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private fb: FormBuilder,
    private http: HttpClient,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.blogService.getBlogDetails(id).subscribe(res => {
      console.log(res, 'response_blogDetails')
      this.selectedBlog = res.blog;
    })
  }

  commentForm: FormGroup = this.fb.group({
    blogComments: this.fb.array([new FormControl('')]),
  })

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

  onCommentSubmit(comment: string){
    this.comments.push(comment);
    this.comment = '';
  }
}

