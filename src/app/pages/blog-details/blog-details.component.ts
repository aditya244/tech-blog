import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, pipe } from 'rxjs';
import { BlogService } from 'src/app/components/blog/blog.service';

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
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.blogService.getBlogDetails(id).subscribe(res => {
      this.selectedBlog = res.blog
    })
  }

  onDeleteBlog(id:any) {
    this.blogService.deleteBlogPost(id)
    .subscribe(res => {
      this.router.navigate(['home'])
    })
  }

}
