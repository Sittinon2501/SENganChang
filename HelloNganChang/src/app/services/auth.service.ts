import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';  // Import เพื่อใช้งานตรวจสอบว่าเป็น client

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private roleSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getUserRole()); // สร้าง BehaviorSubject เพื่อติดตาม role

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { Email: email, Password: password });
  }

  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าอยู่ใน client
      localStorage.setItem('token', token);
      this.roleSubject.next(this.getUserRole());  // เมื่อบันทึก token แล้วอัปเดต role ใน BehaviorSubject
    }
  }

  getToken() {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าอยู่ใน client
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    }
    return null;
  }

  getRole(): Observable<string | null> {
    return this.roleSubject.asObservable();  // ให้ component subscribe เพื่อดึงค่า role
  }

  redirectToRoleBasedPage() {
    const role = this.getUserRole();
    if (role === 'customer') {
      this.router.navigate(['/homecus']);
    } else if (role === 'technician') {
      this.router.navigate(['/hometech']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/admindashboard']);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าอยู่ใน client
      localStorage.removeItem('token');
    }
    this.roleSubject.next(null);  // ล้างค่า role เมื่อออกจากระบบ
    this.router.navigate(['/login']);
  }
}
