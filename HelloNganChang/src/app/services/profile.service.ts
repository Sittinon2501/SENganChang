import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api'; // URL ของ API ที่ใช้งาน

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับสมัครสมาชิก (register)
  register(name: string, email: string, password: string, phone: string, address: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { Name: name, Email: email, Password: password, Phone: phone, Address: address, Role: role });
  }

  // ฟังก์ชันสำหรับสมัครสมาชิกเป็นช่าง (registerTechnician)
  registerTechnician(name: string, email: string, password: string, phone: string, address: string, skills: string, experience: string, availableTime: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registerTechnician`, { Name: name, Email: email, Password: password, Phone: phone, Address: address, Skills: skills, Experience: experience, AvailableTime: availableTime });
  }

  // ฟังก์ชันสำหรับอัพเดตโปรไฟล์
  updateProfile(userId: number, name: string, phone: string, address: string, skills?: string, experience?: string, availableTime?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updateProfile`, { UserID: userId, Name: name, Phone: phone, Address: address, Skills: skills, Experience: experience, AvailableTime: availableTime });
  }
}
