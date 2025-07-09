import { Component } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../core/services/auth.store';
import { catchError, EMPTY } from 'rxjs';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  form: FormGroup;

  hidePassword = true;
  error: string | undefined;

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly router: Router,
    private readonly auth: AuthStore
  ) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(VALIDATOR_PATTERNS.password)]],
    });
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  login(): void {
    const val = this.form.value;

    this.auth
      .login(val.username, val.password)
      .pipe(
        catchError(error => {
          this.handleError(JSON.parse(error.message));
          return EMPTY;
        })
      )
      .subscribe(() => {
        console.log('Login successful!');
        this.router.navigateByUrl('/home');
      });
  }

  handleError(message: string): void {
    this.error = message;
    this.passwordControl?.reset();
  }

  getWrongPasswordMessage(): string {
    if (this.passwordControl.hasError('minlength')) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }
    if (this.passwordControl.hasError('pattern')) {
      return 'Das Passwort muss mindestens drei der folgenden Kategorien erfüllen: Großbuchstabe, Kleinbuchstabe, Zahl oder Sonderzeichen';
    }
    return 'Das Passwort ist ein Pflichtfeld.';
  }

  isLongErrorMessage(formControl: FormControl) {
    return formControl.hasError('pattern') && !(formControl.hasError('minlength') || formControl.hasError('required'));
  }
}
