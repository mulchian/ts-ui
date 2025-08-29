import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../../../core/services/auth.store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VALIDATOR_PATTERNS } from '../../../../shared/forms/validators/validator-patterns';
import { MatButtonModule } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { first } from 'rxjs';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.scss',
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatIcon, MatInput, ReactiveFormsModule, RouterLink],
  providers: [AuthStore],
})
export class ActivateComponent implements OnInit {
  form: FormGroup;
  message: string | undefined;
  successful = false;
  activated = false;
  newActivationNeed = false;
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(VALIDATOR_PATTERNS.email)]],
    });
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.has('user') && params.has('valid')) {
        const idUser = Number(params.get('user'));
        const valid = Number(params.get('valid'));
        // test that validation time is not over
        if (!idUser || idUser <= 0 || valid < Math.floor(Date.now() / 1000)) {
          console.log('Activation link is invalid or expired.');
          this.message =
            'Der Aktivierungslink ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Aktivierungslink an.';
          this.successful = false;
          this.newActivationNeed = true;
        } else {
          this.auth.activateUser(idUser).subscribe({
            next: response => {
              if (response.activated) {
                this.activated = true;
                this.successful = true;
                this.message = 'Dein Konto wurde erfolgreich aktiviert. Du kannst jetzt dein Team erstellen.';
              } else {
                this.successful = false;
                this.message =
                  'Die Aktivierung ist fehlgeschlagen. Bitte überprüfen Sie den Link oder kontaktieren Sie den Support.';
              }
            },
            error: error => {
              console.error('Activation failed:', error);
              this.successful = false;
              this.message = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
            },
          });
        }
      } else {
        console.error('Activation link is missing user or valid parameters.');
        this.router.navigateByUrl('/');
      }
    });
  }

  getWrongEmailMessage(emailControl: FormControl) {
    if (emailControl.hasError('pattern')) {
      return 'Die E-Mail-Adresse muss ein gültiges Format haben.';
    }
    return 'Die E-Mail-Adresse ist ein Pflichtfeld.';
  }

  requestNewActivationLink() {
    const val = this.form.value;
    const link = this.router.url;
    console.log(link);

    this.auth
      .requestNewActivationLink(val.email, link)
      .pipe(first())
      .subscribe((requested: boolean) => {
        if (requested) {
          this.successful = true;
          this.message =
            'Eine E-Mail mit einem neuen Aktivierungslink wurde an die angegebene E-Mail-Adresse gesendet.';
        } else {
          this.successful = false;
          this.message = 'Die angegebene E-Mail-Adresse ist nicht bekannt. Bitte überprüfen Sie Ihre Eingabe.';
        }
      });
  }
}
