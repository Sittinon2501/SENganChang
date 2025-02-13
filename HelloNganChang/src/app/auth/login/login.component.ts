import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        // เก็บ Token และเปลี่ยนเส้นทาง
        this.authService.saveToken(response.token);
        this.authService.redirectToRoleBasedPage();
      },
      error => {
        this.errorMessage = 'Invalid credentials';
      }
    );
  }
}
