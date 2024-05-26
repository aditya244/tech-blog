import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, FormGroup, FormArray, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { title } from 'process';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';
import { AuthService } from 'src/app/services/auth.service';
import { mimeType } from './mime-type-validator';

@Component({
  selector: 'app-post-blog',
  templateUrl: './post-blog.component.html',
  styleUrls: ['./post-blog.component.scss'],
})
export class PostBlogComponent implements OnInit {
  public Editor: any = ClassicEditor;

  public blog: { title: string; content: string; tags: string[]; imagePath: any } = {
    // added this explicit type since was having issues with pushing tag in blog.tags in method addTagtoTagsArray
    title: '',
    content: '',
    tags: [],
    imagePath: ''
  };

  public tag: string = '';
  private isAdmin: boolean = false;
  private mode = 'create';
  private blogId: any;
  form!: FormGroup;
  imagePreview: string | undefined;
  //tags: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(10)]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]}),
      tag: new FormControl(null)
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // add the texts to some constant file
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.blogId = paramMap.get('id');
        this.blogService.getBlogDetails(this.blogId).subscribe((res) => {
          console.log(res, 'EDIT')
          this.blog = {...res.blog};
          this.form.setValue({
            title: this.blog.title,
            tag: this.tag,
            content: this.blog.content,
            image: this.blog.imagePath 
          })
        })
        // if required can add preview in edit image
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
    // this.blog.tags.push(this.tag);
    // this.tag = '';
    const tag = this.form.get('tag')?.value;
    if (tag) {
      this.blog.tags.push(tag);
      this.form.get('tag')?.setValue('');
    }
  }

  onSubmitBlog() {
    if (this.form.invalid) {
      return
    }
    this.blog = {
      title: this.form.get('title')?.value,
      content: this.form.get('content')?.value,
      tags: this.blog.tags,
      imagePath: null
      // check why the new logic is not working
      // tags: this.tags
    };
    // move the two api calls to service file and subscribe here
    const headers = new HttpHeaders({
      isAdmin: this.isAdmin.toString(),
    });
    console.log('valid form')
    if (this.mode === 'create') {
      this.submitBlog(
        this.form.value.title,
        this.form.value.content,
        this.blog.tags,
        this.form.value.image,
        headers
      );
    } else if (this.mode === 'edit') {
      this.updateBlog(this.form.value.title,
        this.form.value.content,
        this.blog.tags,
        this.form.value.image,
        headers);
    }
  }

  submitBlog(title: string, content: any, tags: any, image: File, headers: HttpHeaders) {
    const blogData = new FormData();
    blogData.append("title", title);
    blogData.append("content", content);
    blogData.append("tags", tags);
    blogData.append("image", image, title)

    this.http
    .post<{ message: string }>('http://localhost:3000/api/blogs', blogData, {
      headers: headers,
    })
    .subscribe((response) => {
      console.log(response);
    });
  }

  updateBlog(title: string, content: any, tags: any, image: File | string, headers: HttpHeaders) {
    let blogData;
    console.log(image, 'IMAGE')
    if (typeof(image) === 'object') {
      console.log('gettinginside')
      blogData = new FormData();
      blogData.append("title", title);
      blogData.append("content", content);
      blogData.append("tags", tags);
      blogData.append("image", image, title)
    } else {
      blogData = {
        title: title,
        content: content,
        tags: tags,
        imagePath: image
      }
    }
    this.http.put('http://localhost:3000/api/blogs/edit-blog/' + this.blogId, blogData, {
      headers: headers
    }).subscribe((response) => {
      console.log(response)
    })
  }

  onImageUpload(event: Event) {
    // doesn't identify is a file input, thus using explicit type co``nversion
    let file: any = null;
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      file = input.files[0];
      this.form.patchValue({image: file})
    } else {
      console.error('No file selected or input is null');
    }
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file);
    console.log(this.form, 'FORM');
  }
}
