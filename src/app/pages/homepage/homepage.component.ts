import { Component, OnInit } from '@angular/core';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  blogForFeed: Blog[] = [];

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogService.getBlogsForHomeFeed().subscribe(data => {
      this.blogForFeed = data.blogs;
      console.log(this.blogForFeed, 'blogForFeed')
    })
  }

}
