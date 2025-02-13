import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterTechnicianComponent } from './auth/register-technician/register-technician.component';
import { RegisterComponent } from './auth/register/register.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { HomecusComponent } from './customer/homecus/homecus.component';
import { AdmindashadminDashboardComponent } from './admin/admindashadmin-dashboard/admindashadmin-dashboard.component';
import { HometechComponent } from './technician/hometech/hometech.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent }, // เส้นทางสำหรับการสมัครสมาชิก
  { path: 'login', component: LoginComponent }, // เส้นทางสำหรับการเข้าสู่ระบบ
  { path: 'register-technician', component: RegisterTechnicianComponent }, // เส้นทางสำหรับการสมัครช่าง
  { path: 'update-profile', component: UpdateProfileComponent },
  {
    path: 'homecus',
    component: HomecusComponent,
  }, // ใช้ CustomerGuard
  {
    path: 'hometech',
    component: HometechComponent,
  }, // ใช้ TechnicianGuard
  { path: 'admindashboard', component: AdmindashadminDashboardComponent }, // ใช้ AdminGuard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
