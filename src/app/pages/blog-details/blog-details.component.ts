import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, pipe } from 'rxjs';
import { BlogService } from 'src/app/components/blog/blog.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/components/shared/dialog/dialog.component';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {

  selectedBlog: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.blogService.getBlogDetails(id).subscribe(res => {
      this.selectedBlog = res.blog;
    })
  }

  // onDeleteBlog(id:any) {
  //   this.blogService.deleteBlogPost(id)
  //   .subscribe(res => {
  //     this.router.navigate(['home'])
  //   })
  // }

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
      //data: {selectedBlog: this.selectedBlog, onDeleteBlog: this.onDeleteBlog}
    });
    dialogRef.componentInstance.delete.subscribe(res => {
      if(res) {
        this.onDeleteBlog(this.selectedBlog._id);
      }
    })
  }
}

