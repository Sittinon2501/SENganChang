import { Component, OnInit  } from '@angular/core';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-update-profile',
  standalone: false,
  
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css'
})
export class UpdateProfileComponent implements OnInit {
  userData: any = {
    Name: '',
    Phone: '',
    Address: '',
    Skills: '',
    Experience: '',
    AvailableTime: '',
    Role: ''
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    // ดึงข้อมูลโปรไฟล์จาก API
    this.profileService.getProfile().subscribe(
      (data) => {
        this.userData = data.user; // เข้าถึงข้อมูลใน `user` ที่ได้รับจาก API
        console.log('Profile data fetched:', this.userData);
      },
      (error) => {
        console.error('Error fetching profile:', error);
      }
    );
  }
  

  onUpdateProfile() {
    // Logic สำหรับการอัปเดตโปรไฟล์
    this.profileService.updateProfile(this.userData).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }
}