import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, FormGroup, FormArray, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-post-blog',
  templateUrl: './post-blog.component.html',
  styleUrls: ['./post-blog.component.scss'],
})
export class PostBlogComponent implements OnInit {
  public Editor: any = ClassicEditor;

  public blog: { title: string; content: string; tags: string[] } = {
    // added this explicit type since was having issues with pushing tag in blog.tags in method addTagtoTagsArray
    title: '',
    content: '',
    tags: [],
  };

  public tag: string = '';
  private isAdmin: boolean = false;
  private mode = 'create';
  private blogId: any;

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // add the texts to some constant file
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.blogId = paramMap.get('id');
        this.blogService.getBlogDetails(this.blogId).subscribe((res) => {
          this.blog = {...res.blog}
        })
      } else {
        this.mode = 'create';
        this.blogId = null;
      }
    });
    // move the below logic into a method in service file and call it accodringly in other places
    // app-comp, post-blog, blog-details
    const userDetailsStr: any = sessionStorage.getItem('userDetails');
    const jsonUserDetails = JSON.parse(userDetailsStr);
    this.isAdmin = jsonUserDetails.isAdmin
    console.log(this.isAdmin, 'ISADMIN');
  }

  blogDetails = new UntypedFormControl();

  addTagtoTagsArray() {
    this.blog.tags.push(this.tag);
    this.tag = '';
  }

  onSubmitBlog() {
    // move the two api calls to service file and subscribe here
    const headers = new HttpHeaders({
      isAdmin: this.isAdmin.toString(),
    });
    if (this.mode === 'create') {
      this.http
      .post<{ message: string }>('http://localhost:3000/api/blogs', this.blog, {
        headers: headers,
      })
      .subscribe((response) => {
        console.log(response);
      });
    } else if (this.mode === 'edit') {
      this.updateBlog(headers) 
    }
  }

  updateBlog(headers: HttpHeaders) {
    this.http.put('http://localhost:3000/api/blogs/edit-blog/' + this.blogId, this.blog, {
      headers: headers
    }).subscribe((response) => {
      console.log(response)
    })
  }
}
