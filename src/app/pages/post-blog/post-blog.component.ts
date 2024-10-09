import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { isNgTemplate } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, FormGroup, FormArray, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { faWheatAlt } from '@fortawesome/free-solid-svg-icons';
import { partition } from 'rxjs';
import { Blog } from 'src/app/components/blog/blog.interface';
import { BlogService } from 'src/app/components/blog/blog.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { mimeType } from './mime-type-validator';

@Component({
  selector: 'app-post-blog',
  templateUrl: './post-blog.component.html',
  styleUrls: ['./post-blog.component.scss'],
})
export class PostBlogComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  public Editor: any = ClassicEditor;

  public blog: Blog = {
    // added this explicit type since was having issues with pushing tag in blog.tags in method addTagtoTagsArray
    title: '',
    content: '',
    tags: [],
    imagePath: null,
    datePublished: '',
    keywords: [],
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
  };

  public tag: string = '';
  private keyword: string = ''
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
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      tag: new FormControl(null),
      keyword: new FormControl(null),
      metaDescription: new FormControl(null, { validators: [Validators.required, Validators.maxLength(150)]}),
      ogTitle: new FormControl(null),
      ogDescription: new FormControl(null),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // add the texts to some constant file
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.blogId = paramMap.get('id');
        this.blogService.getBlogDetails(this.blogId).subscribe((res) => {
          console.log(res, 'EDIT');
          this.blog = { ...res.blog };
          this.form.setValue({
            title: this.blog.title,
            tag: this.tag,
            content: this.blog.content,
            image: this.blog.imagePath,
            keyword: this.keyword, // implement like tag but check if it works in edit
            metaDescription: this.blog.metaDescription,
            ogTitle: this.blog.ogTitle,
            ogDescription: this.blog.ogDescription,
          });
        });
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
    this.isAdmin = jsonUserDetails.isAdmin;
    console.log(this.isAdmin, 'ISADMIN');
  }

  blogDetails = new UntypedFormControl();

  addTagtoTagsArray() {
    const tag = this.form.get('tag')?.value;
    if (tag) {
      this.blog.tags.push(tag);
      this.form.get('tag')?.setValue('');
    }
    console.log(this.blog.tags, 'TAGS');
  }

  addKeywordsToArray() {
    const keyword = this.form.get('keyword')?.value;
    if (keyword) {
      this.blog.keywords.push(keyword);
      this.form.get('keyword')?.setValue('');
    }
  }

  onSubmitBlog() {
    if (this.form.invalid) {
      return;
    }
    const date = new Date();
    const datePublished = date.toLocaleDateString(); // Format depends on the user's locale
    this.blog = {
      title: this.form.get('title')?.value,
      content: this.form.get('content')?.value,
      tags: this.blog.tags,
      imagePath: this.form.value.image,
      datePublished: datePublished,
      keywords: this.blog.keywords,
      metaDescription: this.form.value.metaDescription,
      ogTitle: this.form.value.ogTitle,
      ogDescription: this.form.value.ogDescription,
    };

    console.log(this.form.value, 'form_value')
    // move the two api calls to service file and subscribe here
    const headers = new HttpHeaders({
      isAdmin: this.isAdmin.toString(),
    });
    console.log('valid form');
    if (this.mode === 'create') {
      this.submitBlog(
        this.blog,
        headers
      )
    } else if (this.mode === 'edit') {
        this.updateBlog(
          this.blog,
          headers
        )
    }
  }

  submitBlog(
    blog: Blog,
    headers: HttpHeaders,
  ) {
    let blogData = this.createFormObject(blog)
    this.http
      .post<{ message: string }>(`${this.apiUrl}/blogs`, blogData, {
        headers: headers,
      })
      .subscribe((response) => {
        console.log(response);
      });
  }

  updateBlog(
    blog: Blog,
    headers: HttpHeaders
  ) {
    let blogData;
    // this condition is to check if the image is also being update, that is new file
    // or we are using the old image path that has been retrieved from server
    if (typeof blog.imagePath === 'object') {
      console.log('gettinginside');
      blogData = this.createFormObject(blog)
    } else {
      blogData = {
        title: blog.title,
        content: blog.content,
        tags: JSON.stringify(blog.tags),
        imagePath: blog.imagePath,
        publishedDate: blog.datePublished,
        keywords: blog.keywords,
        metaDescription: blog.metaDescription,
        ogTitle: blog.ogTitle,
        ogDescription: blog.ogDescription,
      };
    }
    this.http
      .put(`${this.apiUrl}/blogs/edit-blog/` + this.blogId, blogData, {
        headers: headers,
      })
      .subscribe((response) => {
        console.log(response);
      });
  }

  onImageUpload(event: Event) {
    // doesn't identify is a file input, thus using explicit type conversion
    let file: any = null;
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      file = input.files[0];
      this.form.patchValue({ image: file });
    } else {
      console.error('No file selected or input is null');
    }
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private createFormObject(blog: Blog) {
    const blogData = new FormData();
    blogData.append('title', blog.title);
    blogData.append('content', blog.content);
    blogData.append('tags', JSON.stringify(blog.tags));
    blogData.append('image', blog.imagePath, blog.title);
    blogData.append('datePublished', blog.datePublished);
    blogData.append('keywords', JSON.stringify(blog.keywords));
    blogData.append('metaDescription', blog.metaDescription);
    blogData.append('ogTitle', blog.ogTitle),
    blogData.append('ogDescription', blog.ogDescription);
    return blogData;
  }
}
