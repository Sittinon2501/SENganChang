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

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        // เก็บ Token และ Role
        this.authService.saveToken(response.token);  // เก็บทั้ง token และ role

        // เปลี่ยนเส้นทางตาม role ของผู้ใช้
        this.authService.redirectToRoleBasedPage();
      },
      error => {
        this.errorMessage = 'Invalid credentials';  // ข้อความแสดงข้อผิดพลาดเมื่อกรอกข้อมูลผิด
      }
    );
  }
}
