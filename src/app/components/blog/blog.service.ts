import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlogService {

  private apiUrl = environment.apiUrl;

  private readingListResSubscription = new Subject<{
    message: string;
    error: boolean;
  }>();

  public readingList$ = new BehaviorSubject<String[]>([]);

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {}

  getBlogsForHomeFeed(page: number): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.httpClient.get<any>(`${this.apiUrl}/blogs`, { params }).pipe(
      map(response => ({
        blogs: response.blogs.map((blogData: any) => ({
          title: blogData.title,
          id: blogData._id,
          content: blogData.content,
          imagePath: blogData.imagePath,
          datePublished: blogData.datePublished,
        })),
        totalBlogs: response.totalBlogs,
        currentPage: response.currentPage
      }))
    );
  }

  getBlogDetails(id: any): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/blogs/` + id);
  }

  deleteBlogPost(id: any): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/blogs/` + id);
  }

  getCommentsForBlog(blogId: any): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/comments/` + blogId);
  }

  getReadingListResSubscription() {
    return this.readingListResSubscription.asObservable();
  }

  deleteComment(commentId: string): Observable<any> {
    return this.httpClient.delete(
      `${this.apiUrl}/comments/` + commentId
    );
  }

  addToReadingList(blogId: string | undefined) {
    if (!blogId) {
      console.error('Blog ID is missing!');
      return;
  }
    const userEmailid = localStorage.getItem('email');
    // const userEmailid = this.authService.getUserEmailid();
    console.log(userEmailid, 'userEmailId');
    // if (!userEmailid) {
    //   this.readingListResSubscription.next({message: 'Please login to add it to your reading list!', error: true } )
    //   return
    // }
    this.httpClient
      .post(`${this.apiUrl}/user/add-reading-list`, {
        blogId,
        userEmailid,
      })
      .pipe(
        catchError((error: any) => {
          console.error('Error adding to reading list', error);
          this.readingListResSubscription.next({
            message:
              'Could not add it to reading list, check if it already exists or try again!',
            error: true,
          });
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
          this.addToReadingList$(blogId)
        } else {
          console.log('An error occurred, the reading list was not updated.');
        }
      });
  }

  getReadingListData(emailId: any) {
    console.log(emailId, 'EMAIL_PARAM');
    return this.httpClient.get(
      `${this.apiUrl}/user/reading-list/${emailId}`
    );
  }

  getReadingListBlogsData(ids: string[]) {
    const stringId = ids.join(',');
    const url = `${this.apiUrl}/blogs/readingListBlogs/` + stringId;
    return this.httpClient.get(url);
  }

  removeFromReadingList(userEmailId: string, blogId: string) {
    console.log(blogId, userEmailId, 'paramss');
    const url = `${this.apiUrl}/user/remove-from-reading-list/`;
    this.httpClient
      .post(url, { blogId, userEmailId })
      .pipe(
        catchError((error: any) => {
          console.error('Removing from reading list failed', error);
          return of(null);
        })
      )
      .subscribe((response) => {
        this.router.navigate(['/my-reading-list']);
        if (response) {
          this.removeFromReadingList$(blogId)
          console.log(response, 'READING_LIST_RES');
        } else {
          console.log('An error occurred, the reading list was not updated.');
        }
      });
  }

  public addToReadingList$(blogId: string) {
    const currentReadingList = this.readingList$.getValue();
    console.log(currentReadingList, 'currentReadingList');
    const updatedReadingList = [...currentReadingList, blogId];
    this.readingList$.next(updatedReadingList);
  }

  public removeFromReadingList$(blogId: string) {
      const currentReadingList = this.readingList$.getValue();
      console.log(currentReadingList, 'currentReadingList');
      const updatedReadingList = currentReadingList.filter(id => {
          return id !== blogId
      })
      this.readingList$.next(updatedReadingList);
  }
  
}
