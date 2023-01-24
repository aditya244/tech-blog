import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-post-blog',
  templateUrl: './post-blog.component.html',
  styleUrls: ['./post-blog.component.scss']
})
export class PostBlogComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {}

  blogPostForm: FormGroup = this.fb.group({
    blogTitle: new FormControl(''),
    blogParas: this.fb.array([new FormControl('')]),
  })

  onSubmitBlog() {
    console.log(this.blogPostForm.value)
  }

  get blogParas(): FormArray{
    return <FormArray> this.blogPostForm.get('blogParas')
  }

  addPara(){
    this.blogParas.push(new FormControl(''))
  }

}
