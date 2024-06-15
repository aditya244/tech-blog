import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { catchError, map } from 'rxjs';
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

  constructor(private route: ActivatedRoute, private blogService: BlogService, private router: Router ) { }

  ngOnInit(): void {
    const emailId = localStorage.getItem('email');
    this.blogService.getReadingListData(emailId).subscribe((response: any) => {
      this.readingListRes = response;
      this.fetchReadingListBlogs(this.readingListRes);
      console.log(response, 'reading-list-comp')
      this.blogService.readingList$.next(response.readingList)
    })
  }

  fetchReadingListBlogs(readingListRes: { readingList: string[] }) {
    const readList = readingListRes.readingList;

    this.blogService
      .getReadingListBlogsData(readList)
      .pipe(
        map((data: any) => {
          // added this pipe and map to convert each data _id to id to map with frontends
          console.log(data, 'FETCHED_BLOGS');
          return data.blogs.map((blogData: any) => {
            return {
              title: blogData.title,
              id: blogData._id,
              content: blogData.content,
              imagePath: blogData.imagePath,
            };
          });
        }),
        catchError((error) => {
          console.error('Error fetching blogs:', error);
          // handle error and loader later
          // this.isErrorFromServer = true;
          // this.isLoading = false;
          return error;
        })
      )
      .subscribe((data) => {
        if (data) {
          console.log(data, 'data')
          //this.isLoading = false;
          this.readingList = data;
        }
      });
  }

  removeFromReadingList(blogId: string) {
    const userEmailid: any = localStorage.getItem('email')
    this.blogService.removeFromReadingList(userEmailid, blogId)
    // lol wierd but this is updating the reading list page
    this.router.navigate(['/home']);
  }

}
