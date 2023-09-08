import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../services/auth.store';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';
import { catchError, EMPTY } from 'rxjs';
import { confirmValidator } from '../../../../shared/forms/validators/validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
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
        [Validators.required, Validators.pattern(VALIDATOR_PATTERNS.password)],
      ],
      repeatPassword: [
        '',
        [
          Validators.required,
          confirmValidator('password'),
          Validators.pattern(VALIDATOR_PATTERNS.password),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.pattern(VALIDATOR_PATTERNS.email)],
      ],
      repeatEmail: [
        '',
        [
          Validators.required,
          confirmValidator('email'),
          Validators.pattern(VALIDATOR_PATTERNS.email),
        ],
      ],
    });
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get repeatPasswordControl(): FormControl {
    return this.form.get('repeatPassword') as FormControl;
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get repeatEmailControl(): FormControl {
    return this.form.get('repeatEmail') as FormControl;
  }

  register() {
    const val = this.form.value;

    this.auth
      .register(val.username, val.email, val.password)
      .pipe(
        catchError(error => {
          this.handleError(JSON.parse(error.message));
          return EMPTY;
        })
      )
      .subscribe(() => {
        console.log('Register successful!');
        // navigate to team creation
        this.router.navigateByUrl('/team/create');
      });
  }

  handleError(message: string) {
    this.error = message;
  }

  getWrongPasswordMessage(passwordControl: FormControl) {
    if (passwordControl.hasError('notmatch')) {
      return 'Die Passwörter stimmen nicht überein.';
    }
    if (passwordControl.hasError('minlength')) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }
    if (passwordControl.hasError('pattern')) {
      return 'Das Passwort muss mindestens drei der folgenden Kategorien erfüllen: Großbuchstabe, Kleinbuchstabe, Zahl oder Sonderzeichen';
    }
    return 'Das Passwort ist ein Pflichtfeld.';
  }

  getWrongEmailMessage(emailControl: FormControl) {
    if (emailControl.hasError('notmatch')) {
      return 'Die E-Mail-Adressen stimmen nicht überein.';
    }
    if (emailControl.hasError('pattern')) {
      return 'Die E-Mail-Adresse muss ein gültiges Format haben.';
    }
    return 'Die E-Mail-Adresse ist ein Pflichtfeld.';
  }

  isLongErrorMessage(formControl: FormControl) {
    return (
      formControl.hasError('pattern') &&
      !(
        formControl.hasError('notmatch') ||
        formControl.hasError('minlength') ||
        formControl.hasError('required')
      )
    );
  }
}
