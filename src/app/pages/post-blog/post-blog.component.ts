import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {}

  blogDetails = new FormControl();

  addTagtoTagsArray(){
    this.blog.tags.push(this.tag);
    this.tag = ''    
  }

  onSubmitBlog() {
    this.http.post<{message: string}>("http://localhost:3000/api/blogs", this.blog).subscribe((response) => {
      console.log(response)
    })
  }
}
