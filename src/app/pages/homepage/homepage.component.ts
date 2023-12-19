import { Component, OnInit } from '@angular/core';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  blogForFeed: Blog[] = [];

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogService.getBlogsForHomeFeed()
    .pipe(map(data => {
      // added this pipe and map to convert each data _id to id to map with frontends
      console.log(data, 'FETCHED_BLOGS')
      return data.blogs.map((blogData: any) => {
        return {
          title: blogData.title,
          id: blogData._id,
          content: blogData.content
        }
      })
    }))
    .subscribe(data => {
      this.blogForFeed = data;
    })
  }

}
