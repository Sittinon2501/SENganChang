import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-register',
  standalone: false,
  
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  phone = '';
  address = '';

  constructor(private profileService: ProfileService, private router: Router) {}

  register() {
    const user = {
      Name: this.name,
      Email: this.email,
      Password: this.password,
      Phone: this.phone,
      Address: this.address
    };

    this.profileService.register(user).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Registration failed:', error);
        alert('Error during registration');
      }
    );
  }
}