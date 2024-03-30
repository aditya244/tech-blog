import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './components/blog/blog.component';
import { AuthorComponent } from './pages/author/author.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/login/login.component';
import { PostBlogComponent } from './pages/post-blog/post-blog.component';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomepageComponent},
  {path: 'login', component: LoginComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'blogs', component: BlogComponent},
  {path: 'blog-details/:id', component: BlogDetailsComponent},
  {path: 'about-author', component: AuthorComponent},
  {path: 'post-blog', component: PostBlogComponent, canActivate: [AuthGuard]},
  {path: 'my-reading-list', component: ReadingListComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
