import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-register-technician',
  standalone: false,
  
  templateUrl: './register-technician.component.html',
  styleUrl: './register-technician.component.css'
})
export class RegisterTechnicianComponent {
  technician = {
    Name: '',
    Email: '',
    Password: '',
    Phone: '',
    Address: '',
    Role: 'technician', // Default to technician role
    Skills: '',
    Experience: '',
    AvailableTime: ''
  };

  constructor(private profileService: ProfileService, private router: Router) {}

  onSubmit() {
    this.profileService.registerTechnician(this.technician).subscribe(
      response => {
        alert('Technician registered successfully!');
        this.router.navigate(['/login']); // Redirect to login or another page after registration
      },
      error => {
        alert('Registration failed: ' + error.message);
      }
    );
  }
}

