import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-github-success',
  template: `<p>Logging you in...</p>`
})
export class GithubSuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const data = this.route.snapshot.queryParams['data'];

    if (data) {
      const parsed = JSON.parse(decodeURIComponent(data));
      this.authService.loginWithGithub(parsed);
    }
  }
}