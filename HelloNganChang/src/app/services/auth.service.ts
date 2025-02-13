import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';  // ใช้เพื่อตรวจสอบว่าอยู่ใน client หรือไม่

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private roleSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getUserRole()); // BehaviorSubject เพื่อเก็บค่า role

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  // ฟังก์ชันสำหรับล็อกอิน
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { Email: email, Password: password });
  }

  // ฟังก์ชันสำหรับเก็บ token และ role ใน localStorage
  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าอยู่ใน client
      localStorage.setItem('token', token);
      const role = this.getUserRole();  // ดึง role จาก token
      if (role) {
        localStorage.setItem('role', role);  // เก็บ role ใน localStorage
      }
      this.roleSubject.next(role);  // อัปเดต role ใน BehaviorSubject
    }
  }

  // ฟังก์ชันสำหรับดึง token
  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // ฟังก์ชันเช็คว่า user ได้ล็อกอินแล้วหรือยัง
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ฟังก์ชันสำหรับดึง role จาก localStorage หรือ token
  getUserRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าอยู่ใน client
      const roleFromStorage = localStorage.getItem('role');  // ดึง role จาก localStorage
      if (roleFromStorage) {
        return roleFromStorage;
      }
    }

    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;  // ดึง role จาก token
    }
    return null;
  }

  // ฟังก์ชันสำหรับดึง role ในแบบ Observable
  getRole(): Observable<string | null> {
    return this.roleSubject.asObservable();
  }

  // ฟังก์ชันสำหรับเปลี่ยนเส้นทางตาม role
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

  // ฟังก์ชันสำหรับออกจากระบบ
  logout() {
    if (isPlatformBrowser(this.platformId)) {  // ตรวจสอบว่าอยู่ใน client
      localStorage.removeItem('token');
      localStorage.removeItem('role');  // ลบ role ออกจาก localStorage เมื่อออกจากระบบ
    }
    this.roleSubject.next(null);  // ล้างค่า role ใน BehaviorSubject
    this.router.navigate(['/login']);
  }
}
