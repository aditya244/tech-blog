import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/components/blog/blog.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  blogForFeed:any = [];

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogService.getBlogsForHomeFeed().subscribe(data => {
      this.blogForFeed = data;
    })
  }

}
