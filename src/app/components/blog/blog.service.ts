import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private httpClient: HttpClient) { }

  getBlogsForHomeFeed(): Observable<any> {
    return this.httpClient.get("http://localhost:3000/api/blogs");
  }

  getBlogDetails(id: any): Observable<any> {
    return this.httpClient.get("http://localhost:3000/api/blogs/" + id)
  }

  deleteBlogPost(id: any): Observable<any> {
    return this.httpClient.delete("http://localhost:3000/api/blogs/" + id)
  }

  getCommentsForBlog(blogId: any): Observable<any> {
    return this.httpClient.get("http://localhost:3000/api/comments/" + blogId)
  }

  deleteComment(commentId: string): Observable<any> {
    return this.httpClient.delete("http://localhost:3000/api/comments/" + commentId)
  }
}
