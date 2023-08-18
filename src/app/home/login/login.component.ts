import { Component, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly router: Router,
    private readonly auth: AuthStore
  ) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {}

  login() {
    const val = this.form.value;

    this.auth.isLoggedOut$.subscribe(isLoggedOut => {
      if (isLoggedOut) {
        this.auth.login(val.username, null, val.password).subscribe(
          () => {
            console.log('Login successful!');
          },
          err => {
            console.error('Login failed!');
          }
        );
      }
    });
  }
}
