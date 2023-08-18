import { NgModule } from '@angular/core';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { UserRoutingModule } from './user-routing.module';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserComponent } from './user.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    UserComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  exports: [],
})
export class UserModule {}
