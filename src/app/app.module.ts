import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { BlogComponent } from './components/blog/blog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { AuthorComponent } from './pages/author/author.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FooterComponent } from './components/footer/footer.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { PostBlogComponent } from './pages/post-blog/post-blog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogComponent } from './components/shared/dialog/dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { AuthInterceptor } from './services/auth-interceptor';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { MatListModule } from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
//import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  GoogleLoginProvider 
} from '@abacritt/angularx-social-login';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { SubscribeComponent } from './components/shared/subscribe/subscribe.component';
import { SocialLoginComponent } from './components/shared/login-social/social-login.component';
import { SubscribeDialogComponent } from './components/shared/subscribe-dialog/subscribe-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';

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
    DialogComponent,
    ReadingListComponent,
    LoginComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    SubscribeComponent,
    SocialLoginComponent,
    SubscribeDialogComponent,
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
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    CKEditorModule,
    MatToolbarModule,
    //MatLabel,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    ReactiveFormsModule,
    SocialLoginModule,
    FontAwesomeModule,
    MatPaginatorModule
    
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}, {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '894510956645-43med5k8uumdl5drtbf4pgvogfcoee85.apps.googleusercontent.com'
          )
        }
      ],
      onError: (err) => {
        console.error(err);
      }
    } as SocialAuthServiceConfig,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
