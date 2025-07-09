import { Component } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../core/services/auth.store';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false,
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message: string | undefined;
  successful = false;

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly router: Router,
    private readonly auth: AuthStore
  ) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(VALIDATOR_PATTERNS.email)]],
    });
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
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

  requestNewPassword() {
    const val = this.form.value;
    const link = this.router.url.replace('forgot-password', 'change-password');
    console.log(link);

    this.auth.requestNewPasswort(val.username, val.email, link).subscribe((requested: boolean) => {
      if (requested) {
        this.successful = true;
        this.message =
          'Eine E-Mail mit einem Link zum Zurücksetzen des Passworts wurde an die angegebene E-Mail-Adresse gesendet.';
      } else {
        this.successful = false;
        this.message = 'Die Kombination aus User und E-Mail-Adresse ist nicht bekannt.';
      }
    });
  }
}
