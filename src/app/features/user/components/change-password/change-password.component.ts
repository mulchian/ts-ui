import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';
import { confirmValidator } from '../../../../shared/forms/validators/validator';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  hidePassword = true;
  hideConfirmPassword = true;
  successful = false;
  message: string | undefined;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
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
    });
  }

  changePassword() {
    const val = this.form.value;

    if (val.password && val.password === val.repeatPassword) {
      this.successful = true;
      this.message = 'Passwort erfolgreich geändert.';
    }
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get repeatPasswordControl(): FormControl {
    return this.form.get('repeatPassword') as FormControl;
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
