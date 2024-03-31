import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-post-blog',
  templateUrl: './post-blog.component.html',
  styleUrls: ['./post-blog.component.scss']
})
export class PostBlogComponent implements OnInit {

  public Editor: any = ClassicEditor;

  public blog: { title: string; content: string; tags: string[] } = {
    // added this explicit type since was having issues with pushing tag in blog.tags in method addTagtoTagsArray
    title: '',
    content: '',
    tags: []
  }

  public tag: string = '';
  private isAdmin: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    console.log(this.isAdmin, 'ISADMIN')
  }

  blogDetails = new FormControl();

  addTagtoTagsArray(){
    this.blog.tags.push(this.tag);
    this.tag = ''    
  }

  onSubmitBlog() {
    const headers = new HttpHeaders({
      'isAdmin': this.isAdmin.toString()
    })
    this.http.post<{message: string}>("http://localhost:3000/api/blogs", this.blog, {headers: headers}).subscribe((response) => {
      console.log(response)
    })
  }
}
