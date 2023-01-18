import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private httpClient: HttpClient) { }

  getBlogsForHomeFeed(): Observable<any> {
    return this.httpClient.get("assets/mock-data.json");
  }

  getBlogDetails(): Observable<any> {
    return this.httpClient.get("assets/mock-data-blog-details.json")
  }
}
