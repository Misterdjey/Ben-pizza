import { Component, inject } from '@angular/core';
import { AuthService } from '../admin/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
})
export class LoginComponent {
  protected auth = inject(AuthService);

  login() {
    this.auth.loginWithGoogle();
  }
}
