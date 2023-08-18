import { Component } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../services/auth.store';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  hidePassword = true;

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
    });
  }

  register() {
    // this.auth.register();
  }
}
