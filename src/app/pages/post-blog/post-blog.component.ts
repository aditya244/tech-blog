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
  public blog = {
    title: '',
    content: '',
  }

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {}

  blogDetails = new FormControl();

  // blogPostForm: FormGroup = this.fb.group({
  //   blogTitle: new FormControl(''),
  //   blogParas: this.fb.array([new FormControl('')]),
  // })

  onSubmitBlog() {
    this.http.post<{message: string}>("http://localhost:3000/api/blogs", this.blog).subscribe((response) => {
      console.log(response)
    })
  }

  // get blogParas(): FormArray{
  //   return <FormArray> this.blogPostForm.get('blogParas')
  // }

  // addPara(){
  //   this.blogParas.push(new FormControl(''))
  //   console.log('addPara called');
  // }

}
