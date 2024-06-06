import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readingListResSubscription = new Subject<{
    message: string;
    error: boolean;
  }>();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  getBlogsForHomeFeed(): Observable<any> {
    return this.httpClient.get('https://localhost:3000/api/blogs');
  }

  getBlogDetails(id: any): Observable<any> {
    return this.httpClient.get('http://localhost:3000/api/blogs/' + id);
  }

  deleteBlogPost(id: any): Observable<any> {
    return this.httpClient.delete('http://localhost:3000/api/blogs/' + id);
  }

  getCommentsForBlog(blogId: any): Observable<any> {
    return this.httpClient.get('http://localhost:3000/api/comments/' + blogId);
  }

  getReadingListResSubscription() {
    return this.readingListResSubscription.asObservable();
  }

  deleteComment(commentId: string): Observable<any> {
    return this.httpClient.delete(
      'http://localhost:3000/api/comments/' + commentId
    );
  }

  addToReadingList(blogId: string) {
    const userEmailid = localStorage.getItem('email');
    // const userEmailid = this.authService.getUserEmailid();
    console.log(userEmailid, 'userEmailId');
    // if (!userEmailid) {
    //   this.readingListResSubscription.next({message: 'Please login to add it to your reading list!', error: true } )
    //   return
    // }
    this.httpClient
      .post('http://localhost:3000/api/user/add-reading-list', {
        blogId,
        userEmailid,
      })
      .pipe(
        catchError((error: any) => {
          console.error('Error adding to reading list', error);
          this.readingListResSubscription.next({message: 'Could not add it to reading list, check if it already exists or try again!', error: true } )
          return of(null); 
        })
      )
      .subscribe((response) => {
        if (response) {
          console.log(response, 'READING_LIST_RES');
          this.readingListResSubscription.next({
            message: 'Successfully added to reading list',
            error: false,
          });
        } else {
          console.log('An error occurred, the reading list was not updated.');
        }
      });
  }

  getReadingListData(emailId: any) {
    console.log(emailId, 'EMAIL_PARAM');
    return this.httpClient.get(
      `http://localhost:3000/api/user/reading-list/${emailId}`
    );
  }

  getReadingListBlogsData(ids: string[]) {
    const stringId = ids.join(',');
    const url = 'http://localhost:3000/api/blogs/readingListBlogs/' + stringId;
    return this.httpClient.get(url);
  }
}
