import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';

@Component({
  selector: 'app-reading-list',
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss']
})
export class ReadingListComponent implements OnInit {

  public readingList: Blog[] = [];
  public readingListRes: any = []

  constructor(private route: ActivatedRoute, private blogService: BlogService) { }

  ngOnInit(): void {
    const emailId = localStorage.getItem('email');
    this.blogService.getReadingListData(emailId).subscribe((response) => {
      this.readingListRes = response;
      this.fetchReadingListBlogs(this.readingListRes)
    })
  }

  fetchReadingListBlogs(readingListRes: { readingList: string[] }) {
    const readList = readingListRes.readingList;
    this.blogService.getReadingListBlogsData(readList).subscribe((response: any)  => {
      console.log(response)
      const blogs = response.blogs
      if(response) {
        this.readingList = response.blogs;
      }
    })
  }

}
