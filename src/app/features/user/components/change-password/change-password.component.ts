import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';
import { confirmValidator } from '../../../../shared/forms/validators/validator';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../../../services/auth.store';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  userId = 0;
  valid = 0;
  hidePassword = true;
  hideConfirmPassword = true;
  successful = false;
  message: string | undefined;

  form: FormGroup;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly auth: AuthStore,
    private fb: FormBuilder
  ) {
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

  ngOnInit(): void {
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        // user is already logged in, so we show extra field for old password
      } else {
        // read user and valid from the get params
        this.route.queryParamMap.subscribe(params => {
          if (params.has('user') && params.has('valid')) {
            this.userId = Number(params.get('user'));
            this.valid = Number(params.get('valid'));
            // test that validation time is not over
            if (
              this.userId <= 0 ||
              this.valid < Math.floor(Date.now() / 1000)
            ) {
              this.router.navigateByUrl('/');
            }
          } else {
            this.router.navigateByUrl('/');
          }
        });
      }
    });
  }

  changePassword() {
    const val = this.form.value;

    if (val.password && val.password === val.repeatPassword) {
      this.auth.changePassword(this.userId, val.password).subscribe(changed => {
        if (changed) {
          this.successful = true;
          this.message = 'Passwort erfolgreich geändert.';
        } else {
          this.successful = false;
          this.message = 'Passwort konnte nicht geändert werden.';
        }
      });
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
