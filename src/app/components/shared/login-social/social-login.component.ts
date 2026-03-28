import {
  Component,
} from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLoginComponent {
  constructor() {}

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  loginWithGithub() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // redirect → no further execution
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${environment.githubClientId}&scope=user:email`;
  }
}
