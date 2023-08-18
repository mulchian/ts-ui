import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [HomeComponent, LoginComponent],
  imports: [
    HomeRoutingModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [],
})
export class HomeModule {}
