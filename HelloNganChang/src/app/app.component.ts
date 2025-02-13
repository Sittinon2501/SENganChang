import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  role: string | null = null;  // สร้างตัวแปร role

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe ให้ตัวแปร role อัปเดตเมื่อมีการเปลี่ยนแปลงใน AuthService
    this.authService.getRole().subscribe((role) => {
      this.role = role;
    });
  }

  logout() {
    this.authService.logout();
  }
}
