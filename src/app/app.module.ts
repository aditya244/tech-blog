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
import { MatFormFieldModule } from '@angular/material/form-field';
import { FooterComponent } from './components/footer/footer.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    BlogComponent,
    BlogsComponent,
    AuthorComponent,
    FooterComponent,
    BlogDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
