import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api'; // URL ของ API

  constructor(private http: HttpClient) {}

  /**
   * สมัครสมาชิกทั่วไป
   * @param user { Name, Email, Password, Phone, Address }
   */
  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * อัปเดตข้อมูลโปรไฟล์
   * @param user { userId, Name, Phone, Address, Role, Skills, Experience, AvailableTime }
   */
  updateProfile(user: any): Observable<any> {
    const token = localStorage.getItem('token');
    
    // ตรวจสอบว่า token มีอยู่หรือไม่
    if (!token) {
      return throwError('Unauthorized: No token found');
    }

    const role = localStorage.getItem('role');
    
    // ตรวจสอบว่า role มีอยู่หรือไม่
    if (!role) {
      return throwError('Unauthorized: No role found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // เพิ่ม role เข้าไปในข้อมูลที่ส่ง
    user.Role = role;

    return this.http.put<any>(`${this.apiUrl}/update-profile`, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * สมัครสมาชิกช่างเทคนิค
   * @param technician { Name, Email, Password, Phone, Address, Skills, Experience }
   */
  registerTechnician(technician: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register-technician`, technician).pipe(
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    
    // ตรวจสอบว่า token มีอยู่หรือไม่
    if (!token) {
      return throwError('Unauthorized: No token found');
    }
  
    try {
      // Decode token เพื่อนำ userId ออกมา
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.userId;  // ดึง userId ออกจาก token
  
      // ส่ง GET request ไปดึงข้อมูลโปรไฟล์ พร้อมส่ง Authorization header
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      return this.http.get<any>(`${this.apiUrl}/getUserProfile/${userId}`, { headers }); // ส่ง token ใน header
    } catch (error) {
      return throwError('Error decoding token or retrieving userId');
    }
  }
  
  // ฟังก์ชันเพื่อจัดการ error จาก HTTP request
  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error);
  }
}
