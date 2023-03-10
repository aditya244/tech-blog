import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { BlogComponent } from './components/blog/blog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { AuthorComponent } from './pages/author/author.component';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FooterComponent } from './components/footer/footer.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { PostBlogComponent } from './pages/post-blog/post-blog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    BlogComponent,
    BlogsComponent,
    AuthorComponent,
    FooterComponent,
    BlogDetailsComponent,
    PostBlogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
