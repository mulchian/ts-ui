import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../services/auth.store';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private passwordPattern =
    /^((?=.*[^A-Za-z0-9])(?=.*[0-9])(?=.*[A-Z])|(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])|(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])|(?=.*[^A-Za-z0-9])(?=.*[0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])).{8,}$/;
  form: FormGroup;

  error: string | undefined;

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly router: Router,
    private readonly auth: AuthStore
  ) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: [
        '',
        [Validators.required, Validators.pattern(this.passwordPattern)],
      ],
    });
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  login() {
    const val = this.form.value;

    this.auth
      .login(val.username, null, val.password)
      .pipe(
        catchError(error => {
          this.handleError(JSON.parse(error.message));
          return EMPTY;
        })
      )
      .subscribe(() => {
        console.log('Login successful!');
      });
  }

  handleError(message: string) {
    this.error = message;
    this.passwordControl?.reset();
  }

  getWrongPasswordMessage() {
    if (this.error) {
      return this.error;
    }
    if (this.passwordControl.hasError('pattern')) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.';
    }
    return 'Das Passwort ist ein Pflichtfeld.';
  }
}
