import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterTechnicianComponent } from './auth/register-technician/register-technician.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { HomecusComponent } from './customer/homecus/homecus.component';
import { AdmindashadminDashboardComponent } from './admin/admindashadmin-dashboard/admindashadmin-dashboard.component';
import { HometechComponent } from './technician/hometech/hometech.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    RegisterTechnicianComponent,
    UpdateProfileComponent,
    HomecusComponent,
    AdmindashadminDashboardComponent,
    HometechComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
