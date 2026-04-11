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
    return this.httpClient.get(`${this.apiUrl}/blogs/comments/` + blogId);
  }

  addComment(commentData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/blogs/comments`, commentData);
  }

  getBlogLikes(blogId: any): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/blogs/likes/${blogId}`);
  }

  addBlogLike(blogId: string, userEmail: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/blogs/likes/add`, { blogId, userEmail });
  }

  removeBlogLike(blogId: string, userEmail: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/blogs/likes/remove`, { blogId, userEmail });
  }

  getReadingListResSubscription() {
    return this.readingListResSubscription.asObservable();
  }

  deleteComment(commentId: string): Observable<any> {
    return this.httpClient.delete(
      `${this.apiUrl}/blogs/comments/` + commentId
    );
  }

  addToReadingList(blogId: string | undefined) {
    if (!blogId) {
      console.error('Blog ID is missing!');
      return;
  }
    const userEmailid = localStorage.getItem('email');
    // const userEmailid = this.authService.getUserEmailid();
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
          this.readingListResSubscription.next({
            message: 'Successfully added to reading list',
            error: false,
          });
          this.addToReadingList$(blogId)
        } else {
          this.readingListResSubscription.next({
            message: 'Could not update the reading list. Please try again.',
            error: true,
          });
        }
      });
  }

  getReadingListData(emailId: any) {
    return this.httpClient.get(
      `${this.apiUrl}/user/reading-list/${emailId}`
    );
  }

  getReadingListBlogsData(ids: string[]) {
    if (!ids || !ids.length) {
    return of({ blogs: [] }); // return empty observable
  }
    const stringId = ids.join(',');
    const url = `${this.apiUrl}/blogs/readingListBlogs/` + stringId;
    return this.httpClient.get(url);
  }

  removeFromReadingList(userEmailId: string, blogId: string) {
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
        }
      });
  }

  public addToReadingList$(blogId: string) {
    const currentReadingList = this.readingList$.getValue();
    const updatedReadingList = [...currentReadingList, blogId];
    this.readingList$.next(updatedReadingList);
  }

  public removeFromReadingList$(blogId: string) {
      const currentReadingList = this.readingList$.getValue();
      const updatedReadingList = currentReadingList.filter(id => {
          return id !== blogId
      })
      this.readingList$.next(updatedReadingList);
  }

  public getSuggestedBlogs(suggestedBlogIds: string[]) {
    const stringId = suggestedBlogIds.join(',');
    return this.httpClient.get(`${this.apiUrl}/blogs/suggestedBlogs/` + stringId);
  }
  
}
