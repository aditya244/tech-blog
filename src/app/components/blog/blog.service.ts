import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private httpClient: HttpClient, private authService: AuthService) {}

  getBlogsForHomeFeed(): Observable<any> {
    return this.httpClient.get('http://localhost:3000/api/blogs');
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

  deleteComment(commentId: string): Observable<any> {
    return this.httpClient.delete(
      'http://localhost:3000/api/comments/' + commentId
    );
  }

  addToReadingList(blogId: string) {
    const userEmailid = this.authService.getUserEmailid();
    console.log(userEmailid, 'userEmailId')
    this.httpClient
      .post('http://localhost:3000/api/user/add-reading-list', {
        blogId,
        userEmailid,
      })
      .subscribe((response) => {
        console.log(response, 'READING_LIST_RES');
      });
  }
}
